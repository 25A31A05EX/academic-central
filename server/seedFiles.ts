import fs from 'fs';
import path from 'path';

function createSamplePdf(filePath: string, title: string, subtitle: string) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 180 >>
stream
BT
/F1 18 Tf
50 720 Td
(${title}) Tj
/F1 12 Tf
0 -30 Td
(${subtitle}) Tj
0 -25 Td
(Official Academic Central Document - Persistent PDF Storage) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000227 00000 n 
0000000460 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
530
%%EOF`;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

export function seedInitialPdfFiles() {
  const dir = path.join(process.cwd(), 'data', 'uploads');
  createSamplePdf(path.join(dir, 'assignments', 'CS401_Assignment_2_BalancedTrees.pdf'), 'CS401 Assignment 2', 'Balanced Trees & AVL Implementation');
  createSamplePdf(path.join(dir, 'assignments', 'CS402_Sync_Assignment.pdf'), 'CS402 Assignment', 'Process Synchronization with Mutex');
  createSamplePdf(path.join(dir, 'assignments', 'CS403_Schema_Normalization_Case.pdf'), 'CS403 DBMS Assignment', 'Schema Normalization');
  createSamplePdf(path.join(dir, 'assignments', 'CS404_Wireshark_Lab_Assignment.pdf'), 'CS404 Networks Assignment', 'Subnetting & Wireshark');

  createSamplePdf(path.join(dir, 'lab-materials', 'CS401_DS_Lab_Manual_Rev3.pdf'), 'CS401 Data Structures Lab', 'Verified Laboratory Manual Cycle 1 & 2');
  createSamplePdf(path.join(dir, 'lab-materials', 'CS402_OS_Kernel_LabManual.pdf'), 'CS402 Operating Systems Lab', 'UNIX System Calls & Threading');
  createSamplePdf(path.join(dir, 'lab-materials', 'CS403_DBMS_Workbook_2026.pdf'), 'CS403 DBMS Workbook', 'Query Optimization & Schema');
  createSamplePdf(path.join(dir, 'lab-materials', 'CS404_Network_Sockets_Lab.pdf'), 'CS404 Computer Networks Lab', 'Socket Programming & Packet Tracing');
  createSamplePdf(path.join(dir, 'lab-materials', 'CS405_WebTech_FullStackGuide.pdf'), 'CS405 Web Technologies', 'Full-Stack React & Node Guide');

  createSamplePdf(path.join(dir, 'submissions', 'RahulSharma_23CS101_AVL_Trees.pdf'), 'Rahul Sharma - 23CS101', 'Assignment 1 Submission: AVL Trees');
  createSamplePdf(path.join(dir, 'submissions', 'RahulSharma_23CS101_POSIX_Semaphores.pdf'), 'Rahul Sharma - 23CS101', 'Assignment 2 Submission: POSIX Semaphores');
  createSamplePdf(path.join(dir, 'submissions', 'Ananya_23CS102_BalancedTrees.pdf'), 'Ananya Patel - 23CS102', 'Assignment 1 Submission: Balanced Trees');
  createSamplePdf(path.join(dir, 'submissions', 'Ananya_23CS102_OS_Sync.pdf'), 'Ananya Patel - 23CS102', 'Assignment 2 Submission: OS Synchronization');
}
