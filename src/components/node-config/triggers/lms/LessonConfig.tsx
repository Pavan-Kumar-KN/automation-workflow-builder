import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '../../types';

const LessonConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [selectedForm, setSelectedForm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for cascading dropdowns
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);
    const [lessons, setLessons] = useState([]);

    // Selected values for cascading
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');

    // Loading states for each dropdown
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingLessons, setLoadingLessons] = useState(false);

    // Fetch courses from API
    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCourses([
                { id: 1, name: 'Automation Mastery' },
                { id: 2, name: 'Data Science Fundamentals' },
                { id: 3, name: 'Web Development Bootcamp' },
                { id: 4, name: 'Machine Learning Basics' }
            ]);
        } catch (error) {
            alert('Failed to fetch courses');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch sections based on selected course
    const fetchSections = async (courseId) => {
        setLoadingSections(true);
        try {
            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock data based on course selection
            const mockSections = {
                1: [
                    { id: 1, name: 'Introduction to Automation' },
                    { id: 2, name: 'Advanced Techniques' },
                    { id: 3, name: 'Best Practices' }
                ],
                2: [
                    { id: 4, name: 'Data Collection' },
                    { id: 5, name: 'Data Analysis' },
                    { id: 6, name: 'Visualization' }
                ],
                3: [
                    { id: 7, name: 'Frontend Development' },
                    { id: 8, name: 'Backend Development' },
                    { id: 9, name: 'Database Management' }
                ],
                4: [
                    { id: 10, name: 'ML Algorithms' },
                    { id: 11, name: 'Model Training' },
                    { id: 12, name: 'Model Evaluation' }
                ]
            };

            setSections(mockSections[courseId] || []);
        } catch (error) {
            alert('Failed to fetch sections');
        } finally {
            setLoadingSections(false);
        }
    };

    // Fetch lessons based on selected section
    const fetchLessons = async (sectionId) => {
        setLoadingLessons(true);
        try {
            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 600));

            // Mock data based on section selection
            const mockLessons = {
                1: [
                    { id: 1, name: 'What is Automation?' },
                    { id: 2, name: 'Setting up Tools' },
                    { id: 3, name: 'First Automation Script' }
                ],
                2: [
                    { id: 4, name: 'Complex Workflows' },
                    { id: 5, name: 'Error Handling' },
                    { id: 6, name: 'Performance Optimization' }
                ],
                // Add more mock data as needed
                4: [
                    { id: 7, name: 'Data Sources' },
                    { id: 8, name: 'Collection Methods' },
                    { id: 9, name: 'Data Quality' }
                ],
                7: [
                    { id: 10, name: 'HTML & CSS Basics' },
                    { id: 11, name: 'JavaScript Fundamentals' },
                    { id: 12, name: 'React Introduction' }
                ]
            };

            setLessons(mockLessons[sectionId] || []);
        } catch (error) {
            alert('Failed to fetch lessons');
        } finally {
            setLoadingLessons(false);
        }
    };

    // Handle course selection
    const handleCourseChange = (courseId) => {
        setSelectedCourse(courseId);
        setSelectedSection(''); // Reset section
        setSelectedLesson(''); // Reset lesson
        setSections([]); // Clear sections
        setLessons([]); // Clear lessons

        if (courseId) {
            fetchSections(courseId);
        }
    };

    // Handle section selection
    const handleSectionChange = (sectionId) => {
        setSelectedSection(sectionId);
        setSelectedLesson(''); // Reset lesson
        setLessons([]); // Clear lessons

        if (sectionId) {
            fetchLessons(sectionId);
        }
    };

    // Handle lesson selection
    const handleLessonChange = (lessonId) => {
        setSelectedLesson(lessonId);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedCourse || !selectedSection || !selectedLesson) {
            alert('Please select course, section, and lesson');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedCourse,
                selectedSection,
                selectedLesson,
                submitted: true,
                submittedAt: new Date().toISOString()
            });

            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Initialize courses on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">{config?.label}</h3>
                <p className="text-sm text-gray-500">{config?.description}</p>
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
                <Label htmlFor="course-select" className="text-sm font-medium text-gray-700">
                    Contact Group <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedCourse}
                    onValueChange={handleCourseChange}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading courses..." : "Select course"} />
                    </SelectTrigger>
                    <SelectContent>
                        {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                                {course.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available courses...</p>
                )}
            </div>

            {/* Section Selection */}
            <div className="space-y-2">
                <Label htmlFor="section-select" className="text-sm font-medium text-gray-700">
                    Select Section <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedSection}
                    onValueChange={handleSectionChange}
                    disabled={!selectedCourse || loadingSections}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue
                            placeholder={
                                !selectedCourse
                                    ? "First select a course"
                                    : loadingSections
                                        ? "Loading sections..."
                                        : sections.length === 0
                                            ? "No sections available"
                                            : "Select section"
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {sections.map((section) => (
                            <SelectItem key={section.id} value={section.id.toString()}>
                                {section.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {loadingSections && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available sections...</p>
                )}
            </div>

            {/* Lesson Selection */}
            <div className="space-y-2">
                <Label htmlFor="lesson-select" className="text-sm font-medium text-gray-700">
                    Select Lesson <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedLesson}
                    onValueChange={handleLessonChange}
                    disabled={!selectedSection || loadingLessons}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue
                            placeholder={
                                !selectedSection
                                    ? "First select a section"
                                    : loadingLessons
                                        ? "Loading lessons..."
                                        : lessons.length === 0
                                            ? "No lessons available"
                                            : "Select lesson"
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {lessons.map((lesson) => (
                            <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                {lesson.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {loadingLessons && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available lessons...</p>
                )}
            </div>

            {/* Selected Values Display */}
            {(selectedCourse || selectedSection || selectedLesson) && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Selected:
                        {selectedCourse && ` Course: ${courses.find(c => c.id.toString() === selectedCourse)?.name}`}
                        {selectedSection && ` → Section: ${sections.find(s => s.id.toString() === selectedSection)?.name}`}
                        {selectedLesson && ` → Lesson: ${lessons.find(l => l.id.toString() === selectedLesson)?.name}`}
                    </p>
                </div>
            )}

            <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={isSubmitting || !selectedCourse || !selectedSection || !selectedLesson}
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default LessonConfig;