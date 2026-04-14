import { Pipe, PipeTransform } from '@angular/core';
import { Candidature } from '../models/candidature.model';

@Pipe({ name: 'countByStatus', standalone: true })
export class CountByStatusPipe implements PipeTransform {
    transform(applications: Candidature[], status: string): number {
        return applications.filter((a) => a.status === status).length;
    }
}
