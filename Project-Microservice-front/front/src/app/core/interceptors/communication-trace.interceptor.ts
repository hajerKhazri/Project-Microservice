import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { CommunicationTraceService } from '../services/communication-trace.service';

export const communicationTraceInterceptor: HttpInterceptorFn = (req, next) => {
  const trace = inject(CommunicationTraceService);
  const startedAt = Date.now();
  const traceId = trace.start(req.method, req.urlWithParams, req.body);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          trace.succeed(traceId, Date.now() - startedAt, event.status, event.body);
        }
      },
      error: (error: HttpErrorResponse) => {
        trace.fail(traceId, Date.now() - startedAt, error.status, error.error ?? error.message);
      }
    })
  );
};
