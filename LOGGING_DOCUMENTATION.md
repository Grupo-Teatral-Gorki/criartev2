# Logging Service Documentation

## Overview
The logging service tracks every user action in the Criarte platform, storing detailed logs in a Firebase Firestore collection called "logs". Each document represents a user and contains an array of their actions with timestamps.

## Database Schema

### Collection: `logs`
Each document structure:
```typescript
{
  user: string,           // User email
  logs: LogEntry[],       // Array of log entries
  createdAt: Timestamp,   // Document creation time
  updatedAt: Timestamp    // Last update time
}
```

### LogEntry Structure:
```typescript
{
  action: ActionType,           // Type of action performed
  timestamp: Date,              // When the action occurred
  filename?: string,            // File name (for file operations)
  metadata?: Record<string, any> // Additional context data
}
```

## Action Types
- `button_click` - Any button interaction
- `file_upload_attempt` - File upload initiated
- `file_upload_success` - File uploaded successfully
- `file_upload_failure` - File upload failed
- `navigation` - Page/route changes
- `login` - User authentication
- `logout` - User sign out
- `form_submit` - Form submissions
- `modal_open` - Modal dialogs opened
- `modal_close` - Modal dialogs closed
- `search` - Search operations
- `download` - File downloads
- `delete` - Delete operations
- `edit` - Edit operations
- `view` - View operations

## Usage

### 1. Automatic Button Logging
All `Button` components automatically log clicks:

```tsx
import Button from "./components/Button";

<Button 
  label="Save Document" 
  onClick={handleSave}
  logMetadata={{ documentId: "doc-123", section: "editor" }}
/>
```

### 2. Manual Logging in Components
```tsx
import { useLogging } from "../hooks/useLogging";

const MyComponent = () => {
  const loggingService = useLogging();

  const handleAction = async () => {
    await loggingService.logSearch("user query", 15, { 
      component: "SearchBar",
      filters: ["active", "recent"] 
    });
  };
};
```

### 3. File Upload Logging
File upload components automatically log:
- Upload attempts (with file details)
- Success/failure outcomes
- Compression operations
- Error details

```tsx
// Automatically logged in UploadFiles and ProfileImageUpload components
// Logs include: filename, file size, file type, success/failure reasons
```

### 4. Available Logging Methods

```typescript
// Button clicks
await loggingService.logButtonClick(buttonName, metadata);

// File operations
await loggingService.logFileUploadAttempt(filename, metadata);
await loggingService.logFileUploadSuccess(filename, metadata);
await loggingService.logFileUploadFailure(filename, error, metadata);
await loggingService.logDownload(filename, metadata);

// Navigation
await loggingService.logNavigation(fromPage, toPage, metadata);

// Authentication
await loggingService.logLogin(metadata);
await loggingService.logLogout(metadata);

// User interactions
await loggingService.logSearch(query, resultsCount, metadata);
await loggingService.logModalOpen(modalName, metadata);
await loggingService.logModalClose(modalName, metadata);
await loggingService.logFormSubmit(formName, metadata);

// Data operations
await loggingService.logEdit(itemType, itemId, metadata);
await loggingService.logDelete(itemType, itemId, metadata);
await loggingService.logView(itemType, itemId, metadata);
```

## Implementation Details

### Authentication Integration
The logging service automatically detects the current user through Firebase Auth and associates all logs with their email address.

### Error Handling
- Failed logging operations are logged to console but don't interrupt user flow
- Service continues working even if user is not authenticated (logs warning)

### Performance
- Uses Firebase batch operations for efficiency
- Logs are written asynchronously to avoid blocking UI
- Singleton pattern ensures single service instance

## Security & Privacy
- Only authenticated users can generate logs
- Logs are associated with user email addresses
- Sensitive data should not be included in metadata
- Consider data retention policies for compliance

## Monitoring Logs
Access logs through Firebase Console:
1. Go to Firestore Database
2. Navigate to `logs` collection
3. Each document represents a user's complete activity log
4. Use Firebase queries to filter and analyze user behavior

## Example Log Entry
```json
{
  "user": "user@example.com",
  "logs": [
    {
      "action": "button_click",
      "timestamp": "2025-08-29T20:15:30.000Z",
      "metadata": {
        "buttonName": "Save Document",
        "variant": "save",
        "documentId": "doc-123"
      }
    },
    {
      "action": "file_upload_success",
      "timestamp": "2025-08-29T20:16:45.000Z",
      "filename": "document.pdf",
      "metadata": {
        "fileSize": 1048576,
        "fileType": "application/pdf",
        "component": "UploadFiles"
      }
    }
  ],
  "createdAt": "2025-08-29T20:15:30.000Z",
  "updatedAt": "2025-08-29T20:16:45.000Z"
}
```
