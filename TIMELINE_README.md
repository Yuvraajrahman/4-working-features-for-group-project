# Course Timeline Feature

## Overview
The Course Timeline feature provides a visual representation of the course progression, showing important events from course creation to completion. It displays a vertical timeline with alternating content on both sides, using colorful icons and styling to distinguish different types of events.

## Features

### Timeline Events
1. **Course Start**: Shows when the room was created
2. **Assessments**: All assessments (quizzes, assignments, projects, exams) are displayed chronologically
3. **Course End**: Automatically added one day after the final exam

### Visual Design
- **Vertical Timeline**: Uses DaisyUI's `timeline-vertical` component
- **Alternating Sides**: Content alternates between left and right sides for visual balance
- **Colorful Icons**: Different assessment types have distinct icons and colors:
  - 🎓 Final Exam (red)
  - 📄 Mid-term Exam (orange)
  - ✅ Quiz (green)
  - 📚 Assignment (blue)
  - 📅 Project (purple)
  - 🎯 Course Start/End (green/red)

### Styling
- Timeline boxes have colored borders (primary for left, secondary for right)
- Icons are color-coded based on assessment type
- Responsive design that works on different screen sizes

## Implementation

### Components
- `CourseTimeline.jsx`: Main timeline component
- `TimelineDemo.jsx`: Demo component for testing

### Integration
The timeline is integrated into:
- Teacher room view (`T_Room.jsx`) - Right sidebar (persistent across all tabs)
- Student room view (`S_Room.jsx`) - Right sidebar (persistent)

### Data Flow
1. Fetches room data (including `createdAt`)
2. Fetches all assessments for the room
3. Generates timeline events in chronological order
4. Renders timeline with alternating sides

## Usage

### For Teachers
1. Navigate to a room
2. The timeline appears as a persistent sidebar on the right side
3. Switch between Forum, Materials, and Assessment tabs - the timeline stays visible
4. As you add assessments, they automatically appear in the timeline

### For Students
1. Navigate to a room
2. The timeline appears as a persistent sidebar on the right side
3. View all course events in chronological order while browsing announcements

### Demo
Visit `/demo/timeline` to see a demo of the timeline with sample data.

## Technical Details

### Props
- `roomId`: The ID of the room
- `room`: Room object containing `createdAt` and other details
- `demoAssessments`: Optional prop for testing with sample data

### State Management
- Fetches assessments from `/assessments/room/${roomId}` API endpoint
- Sorts events by date automatically
- Handles loading states and error cases

### Styling Classes
- Uses DaisyUI timeline classes: `timeline`, `timeline-vertical`, `timeline-start`, `timeline-middle`, `timeline-end`
- Custom styling for timeline boxes and icons
- Responsive design with Tailwind CSS

## Future Enhancements
- Add ability to edit timeline events
- Include more event types (announcements, materials, etc.)
- Add filtering options
- Export timeline as PDF or image
- Add notifications for upcoming events
