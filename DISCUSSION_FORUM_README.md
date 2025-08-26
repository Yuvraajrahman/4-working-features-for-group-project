# Discussion Forum Feature

## Overview
The discussion forum is a new feature that allows teachers to create announcements and communicate with students in their rooms. Each room now has a dedicated discussion forum where teachers can post announcements, pin important messages, and organize content with tags.

## Features

### For Teachers:
- **Create Announcements**: Teachers can create new announcements with title, content, and optional tags
- **Pin Important Messages**: Important announcements can be pinned to the top of the forum
- **Edit Announcements**: Teachers can edit existing announcements
- **Delete Announcements**: Teachers can remove announcements they no longer need
- **Tag System**: Use tags to categorize announcements (e.g., "homework", "exam", "important")

### For Students:
- **View Announcements**: Students can read all announcements in their enrolled rooms
- **Read-Only Access**: Students can view but cannot create, edit, or delete announcements
- **Pinned Messages**: Important pinned announcements are highlighted and appear at the top

## Technical Implementation

### Backend
- **New Model**: `Announcement.js` - Stores announcement data with references to rooms and authors
- **New Controller**: `announcementController.js` - Handles CRUD operations for announcements
- **New Routes**: `announcementRoutes.js` - API endpoints for announcement management
- **Database Schema**: Includes title, content, author, room reference, pin status, and tags

### Frontend
- **Teacher View**: `T_Room.jsx` - Updated with tabs for room settings and discussion forum
- **Student View**: `S_Room.jsx` - New component for students to view room announcements
- **Components**:
  - `DiscussionForum.jsx` - Main forum component
  - `CreateAnnouncement.jsx` - Form for creating new announcements
  - `AnnouncementCard.jsx` - Individual announcement display with edit/delete options

## API Endpoints

### GET `/api/announcements/room/:roomId`
- Fetch all announcements for a specific room
- Returns announcements sorted by pin status and creation date

### POST `/api/announcements/room/:roomId`
- Create a new announcement for a room
- Requires title, content, and optional tags and pin status

### PUT `/api/announcements/:id`
- Update an existing announcement
- Can modify title, content, tags, and pin status

### DELETE `/api/announcements/:id`
- Delete an announcement

### PATCH `/api/announcements/:id/pin`
- Toggle the pin status of an announcement

## Usage

### For Teachers:
1. Navigate to a room you manage
2. Click on the "Discussion Forum" tab
3. Click "New Announcement" to create a post
4. Fill in the title, content, and optional tags
5. Check "Pin this announcement" if it's important
6. Click "Create Announcement"

### For Students:
1. Navigate to a room you're enrolled in
2. View all announcements in the discussion forum
3. Pinned announcements appear at the top with a warning border
4. Read announcements and check tags for categorization

## Future Enhancements
- Student comments on announcements
- Rich text editor for announcements
- File attachments
- Notification system for new announcements
- Search and filter functionality
- Announcement templates

## Database Schema
```javascript
{
  title: String (required),
  content: String (required),
  author: ObjectId (ref: "instructors"),
  room: ObjectId (ref: "Room"),
  isPinned: Boolean (default: false),
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```
