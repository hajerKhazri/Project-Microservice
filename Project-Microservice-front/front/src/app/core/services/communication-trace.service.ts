import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CommunicationTraceStatus = 'pending' | 'success' | 'error';

export interface CommunicationTraceEntry {
  id: number;
  method: string;
  url: string;
  startedAt: string;
  status: CommunicationTraceStatus;
  httpStatus?: number;
  durationMs?: number;
  requestPreview?: string;
  responsePreview?: string;
  errorPreview?: string;
  responseSize?: number;
}

@Injectable({ providedIn: 'root' })
export class CommunicationTraceService {
  private readonly maxEntries = 80;
  private readonly entriesSubject = new BehaviorSubject<CommunicationTraceEntry[]>([]);
  private nextId = 1;

  readonly entries$ = this.entriesSubject.asObservable();

  start(method: string, url: string, requestBody: unknown): number {
    const entry: CommunicationTraceEntry = {
      id: this.nextId++,
      method: method.toUpperCase(),
      url,
      startedAt: new Date().toISOString(),
      status: 'pending',
      requestPreview: previewOf(requestBody)
    };

    this.entriesSubject.next([entry, ...this.entriesSubject.value].slice(0, this.maxEntries));
    return entry.id;
  }

  succeed(id: number, durationMs: number, httpStatus: number, responseBody: unknown): void {
    this.patch(id, {
      status: 'success',
      httpStatus,
      durationMs,
      responsePreview: previewOf(responseBody),
      responseSize: sizeOf(responseBody)
    });
  }

  fail(id: number, durationMs: number, httpStatus: number | undefined, errorBody: unknown): void {
    this.patch(id, {
      status: 'error',
      httpStatus,
      durationMs,
      errorPreview: previewOf(errorBody)
    });
  }

  clear(): void {
    this.entriesSubject.next([]);
  }

  private patch(id: number, partial: Partial<CommunicationTraceEntry>): void {
    this.entriesSubject.next(
      this.entriesSubject.value.map((entry) =>
        entry.id === id ? { ...entry, ...partial } : entry
      )
    );
  }
}

function previewOf(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return trimPreview(value);
  }

  try {
    return trimPreview(JSON.stringify(value));
  } catch {
    return trimPreview(String(value));
  }
}

function sizeOf(value: unknown): number | undefined {
  const preview = previewOf(value);
  return preview ? preview.length : undefined;
}

function trimPreview(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
}
