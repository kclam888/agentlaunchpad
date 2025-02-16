Set up the page structure according to the following prompt:
   
<page-structure-prompt>
Next.js route structure based on navigation menu items (excluding main route). Make sure to wrap all routes with the component:

Routes:
- /home
- /inbox
- /tasks
- /templates
- /tools
- /integrations
- /beam-ai
- /beam-onboarding-agent-tasks-id-04339

Page Implementations:
/home:
Core Purpose: Dashboard overview showing key metrics and recent activities
Key Components
- Activity Feed
- Quick Actions Panel
- Statistics Dashboard
- Recent Documents Grid
Layout Structure
- Two-column layout with sidebar
- Responsive grid system for metrics
- Collapsible sections for mobile

/inbox:
Core Purpose: Message and notification management center
Key Components
- Message List
- Filter Controls
- Search Bar
- Message Preview Panel
Layout Structure
- Three-panel layout (list

/tasks:
Core Purpose: Task management and tracking
Key Components
- Task List
- Kanban Board Toggle
- Priority Filters
- Due Date Calendar
Layout Structure
- Flexible view switching (list

/templates:
Core Purpose: Template library and management
Key Components
- Template Gallery
- Category Filters
- Template Editor
- Preview Mode
Layout Structure
- Grid layout for template cards
- Sidebar for categories
- Modal for template editing

/tools:
Core Purpose: Access to productivity and workflow tools
Key Components
- Tool Directory
- Quick Launch Panel
- Usage Statistics
- Tool Settings
Layout Structure
- Card-based grid layout
- Expandable tool cards
- List view for mobile

/integrations:
Core Purpose: Integration management and configuration
Key Components
- Integration Marketplace
- Connection Status Panel
- Setup Wizards
- API Keys Management
Layout Structure
- Marketplace grid
- Configuration sidebar
- Wizard stepper layout

/beam-ai:
Core Purpose: AI assistant interface and settings
Key Components
- Chat Interface
- Model Selection
- Training Controls
- Performance Metrics
Layout Structure
- Split view (chat

/beam-onboarding-agent-tasks-id-04339:
Core Purpose: Specific onboarding task management
Key Components
- Task Details Form
- Progress Tracker
- Document Upload
- Approval Workflow
Layout Structure
- Vertical stepper layout
- Side panel for context
- Fixed bottom actions

Layouts:
DefaultLayout:
- Applicable routes: /home, /inbox, /tasks, /templates
- Core components
  * Navigation Sidebar
  * Header with Search
  * User Menu
  * Breadcrumbs
- Responsive behavior
  * Collapsible sidebar on tablet
  * Bottom navigation on mobile
  * Fluid content area

ToolLayout
- Applicable routes: /tools, /integrations, /beam-ai
- Core components
  * Minimal Header
  * Context Sidebar
  * Quick Actions Bar
- Responsive behavior
  * Full-screen on mobile
  * Floating action menu
  * Collapsible panels

TaskLayout
- Applicable routes: /beam-onboarding-agent-tasks-id-04339
- Core components
  * Progress Header
  * Context Panel
  * Action Footer
- Responsive behavior
  * Single column on mobile
  * Sticky header/footer
  * Expandable sections
</page-structure-prompt>