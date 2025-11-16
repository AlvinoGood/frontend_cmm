import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { PdfJsViewerModule, PdfJsViewerComponent } from 'ng2-pdfjs-viewer';
import { MedicalTemplatesService } from '../../../../../core/services/medical-templates.service';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, PdfJsViewerModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss'
})
export class PdfViewerComponent implements OnChanges {
  @Input() templateId: number | null = null;

  // @ViewChild('pdfViewer') pdfViewer?: PdfJsViewerComponent;

  loading = false;
  error: string | null = null;
  pdfSrc: Blob | null = null;

  private readonly pdfService = inject(MedicalTemplatesService);

  ngOnChanges(changes: SimpleChanges): void {
    if ('templateId' in changes) {
      if (!this.templateId) {
        this.loading = false;
        this.error = null;
        this.pdfSrc = null;
        return;
      }
      this.loadPdf(this.templateId);
    }
  }

private loadPdf(id: number): void {
    this.loading = true;
    this.error = null;
    this.pdfSrc = null;

    this.pdfService.getPdf(id).subscribe({
      next: (blob) => {
        this.pdfSrc = blob;   
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar PDF', err);
        this.loading = false;
        this.error = 'No se pudo cargar el PDF.';
        this.pdfSrc = null;
      }
    });
  }
}