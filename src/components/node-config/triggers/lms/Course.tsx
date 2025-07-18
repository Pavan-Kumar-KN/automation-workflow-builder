import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ConfigComponentProps } from '../../types';

const Course: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize selected courses from config
  useEffect(() => {
    if (config?.selectedCourses && Array.isArray(config.selectedCourses)) {
      setSelectedCourses(config.selectedCourses);
    }
  }, [config]);

  // Fetch courses from API
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      // Simulating API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCourses([
        "Automation Mastery",
        "Data Science Fundamentals",
        "Web Development Bootcamp",
        "Machine Learning Basics",
        "Digital Marketing Course",
        "Python Programming",
        "React Development",
        "Node.js Backend"
      ]);
    } catch (error) {
      alert('Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle course selection
  const handleCourseSelect = (courseName) => {
    if (!selectedCourses.includes(courseName)) {
      setSelectedCourses([...selectedCourses, courseName]);
    }
    setIsOpen(false);
  };

  // Handle course removal
  const handleCourseRemove = (courseName) => {
    setSelectedCourses(selectedCourses.filter(course => course !== courseName));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      alert('Please select at least one course');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setConfig({
        ...config,
        selectedCourses,
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

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">Course Completed</h3>
        <p className="text-sm text-gray-500">When selected courses are completed, the workflow will trigger.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-select" className="text-sm font-medium text-gray-700">
          Select Courses <span className="text-red-500">*</span>
        </Label>

        {/* Multi-select input area */}
        <div className="relative">
          <div
            className="min-h-[40px] w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedCourses.length === 0 ? (
              <span className="text-gray-400">
                {isLoading ? "Loading courses..." : "Select Courses"}
              </span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedCourses.map((course, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-sm text-gray-700 border"
                  >
                    {course}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseRemove(course);
                      }}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown menu */}
          {isOpen && !isLoading && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {courses
                .filter(course => !selectedCourses.includes(course))
                .map((course, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleCourseSelect(course)}
                >
                  {course}
                </div>
              ))}
              {courses.filter(course => !selectedCourses.includes(course)).length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  All courses selected
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading && (
          <p className="text-xs text-blue-600 animate-pulse">Loading available courses...</p>
        )}
      </div>

      {/* Show selected courses */}
      {selectedCourses.length > 0 && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Selected Courses:</p>
          <div className="space-y-1">
            {selectedCourses.map((course, index) => (
              <p key={index} className="text-sm text-gray-700">• {course}</p>
            ))}
          </div>
        </div>
      )}

      {/* Show selected courses count */}
      {selectedCourses.length > 0 && (
        <div className="text-sm text-gray-600">
          Automation will trigger when any of these {selectedCourses.length} course{selectedCourses.length === 1 ? '' : 's'} {selectedCourses.length === 1 ? 'is' : 'are'} completed
        </div>
      )}

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={isSubmitting || selectedCourses.length === 0}
      >
        {isSubmitting ? 'Saving...' : 'Confirm'}
      </Button>
    </div>
  );
};

export default Course;
