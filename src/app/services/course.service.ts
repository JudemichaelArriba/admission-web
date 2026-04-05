import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Course } from '../models/course.model';

@Injectable({
    providedIn: 'root'
})
export class CourseService {
    private readonly apiUrl = `${environment.apiUrl}/courses`;

    constructor(private http: HttpClient) { }


    getActiveCourses(): Observable<Course[]> {
        return this.http.get<Course[]>(this.apiUrl);
    }

    getCourseById(id: number): Observable<Course> {
        return this.http.get<Course>(`${this.apiUrl}/${id}`);
    }
}