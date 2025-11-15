import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfJsViewerModule, PdfJsViewerComponent } from 'ng2-pdfjs-viewer';
import { MedicalTemplatesService } from '../../../../../core/services/medical-templates.service';
import { AlertService } from '../../../../../core/services/alert.service';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, PdfJsViewerModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerComponent implements OnChanges {
  private readonly svc: MedicalTemplatesService = inject(MedicalTemplatesService);
  private readonly alerts: AlertService = inject(AlertService);

  @Input() templateId: number | null = null;

  loading = signal(false);

  @ViewChild('pdfViewer', { static: false })
  private pdfViewer?: PdfJsViewerComponent;

  ngOnChanges(changes: SimpleChanges): void {
    if ('templateId' in changes) {
      const id = this.templateId;
      if (id != null) {
        this.loadPdf(id);
      }
    }
  }

  onPdfLoaded(): void {
    this.loading.set(false);

    const viewer = this.pdfViewer as any;
    const pdfApp = viewer?.PDFViewerApplication;

    if (pdfApp?.loadingBar?.hide) {
      pdfApp.loadingBar.hide();
    }
  }

  private loadPdf(id: number): void {
    if (!id) {
      return;
    }

    this.loading.set(true);

    this.svc.getPdf(id).subscribe({
      next: (blob: any) => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });

        const viewer = this.pdfViewer;
        if (!viewer) {
          this.loading.set(false);
          return;
        }

        viewer.pdfSrc = pdfBlob;
        viewer.refresh();
      },
      error: (err: unknown) => {
        console.error('Error cargando PDF', err);
        this.alerts.error('No se pudo cargar el PDF');
        this.loading.set(false);
      },
    });
  }
}
