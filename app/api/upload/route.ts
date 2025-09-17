import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FileUploadService } from '@/lib/file-upload';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    console.log('API: Session check:', session?.user?.email || 'No session'); // Debug log
    
    if (!session?.user?.email) {
      console.log('API: Authentication failed - no session or email'); // Debug log
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12', // .xlsb
      'text/csv', // .csv
      'text/tab-separated-values', // .tsv
      'application/vnd.oasis.opendocument.spreadsheet' // .ods
    ];

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['xlsx', 'xls', 'xlsm', 'xlsb', 'csv', 'tsv', 'ods'];

    if (!allowedExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload Excel, CSV, TSV, or ODS files.' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // For CSV/TSV files, we could add preview data here
    let preview = null;
    let previewData: any = null;
    
    if (fileExtension === 'csv' || fileExtension === 'tsv') {
      try {
        const text = await file.text();
        const separator = fileExtension === 'csv' ? ',' : '\t';
        const lines = text.split('\n').slice(0, 6);
        preview = lines.map(line => line.split(separator));
        
        // Create preview data structure for database
        if (lines.length > 0) {
          const headers = lines[0].split(separator);
          const dataRows = lines.slice(1, 6); // First 5 data rows
          
          // Convert to TablePreview format
          const rows = dataRows.map(line => {
            const values = line.split(separator);
            const rowObj: Record<string, any> = {};
            headers.forEach((header, index) => {
              rowObj[header] = values[index] || '';
            });
            return rowObj;
          });
          
          previewData = {
            sheets: [file.name],
            firstSheetName: file.name,
            rows: rows
          };
        }
      } catch (error) {
        console.error('Error generating preview:', error);
      }
    }

    // Upload file using the file upload service
    const fileUploadService = new FileUploadService();
    
    // Get user profile to get the correct user ID
    const { data: profile } = await fileUploadService.getUserProfile(session.user.email);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 400 }
      );
    }
    
    const result = await fileUploadService.uploadFile(
      file, 
      previewData || { sheets: [], firstSheetName: null, rows: [] }, 
      profile.id
    );

    return NextResponse.json({
      success: true,
      fileId: result.id,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      preview: preview
    });

  } catch (error) {
    console.error('Upload error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error during file upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}