Initialize Next.js in current directory:
```bash
mkdir temp; cd temp; npx create-next-app@latest . -y --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*" -no --turbo
```

Now let's move back to the parent directory and move all files except prompt.md.

For Windows (PowerShell):
```powershell
cd ..; Move-Item -Path "temp*" -Destination . -Force; Remove-Item -Path "temp" -Recurse -Force
```

For Mac/Linux (bash):
```bash
cd .. && mv temp/* temp/.* . 2>/dev/null || true && rm -rf temp
```

Set up the frontend according to the following prompt:
<frontend-prompt>
Create detailed components with these requirements:
1. Use 'use client' directive for client-side components
2. Make sure to concatenate strings correctly using backslash
3. Style with Tailwind CSS utility classes for responsive design
4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
7. Create root layout.tsx page that wraps necessary navigation items to all pages
8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
9. Accurately implement necessary grid layouts
10. Follow proper import practices:
   - Use @/ path aliases
   - Keep component imports organized
   - Update current src/app/page.tsx with new comprehensive code
   - Don't forget root route (page.tsx) handling
   - You MUST complete the entire prompt before stopping

<summary_title>
AI Agent Onboarding Task Management Interface
</summary_title>

<image_analysis>

1. Navigation Elements:
- Left sidebar with: Home, Inbox, Tasks, Templates, Tools, Integrations, Beam AI
- Top navigation with: Beam Onboarding Agent > Tasks > ID-04339
- Secondary navigation under "Your Agents" section


2. Layout Components:
- Left sidebar: 250px width, dark theme
- Main content area: flexible width (calc(100% - 250px))
- Task cards: ~100% width of container, 60px height
- Padding: 16px between elements, 24px container padding


3. Content Sections:
- Header with task title and status
- Agent activity section
- Task list with status indicators
- Progress tracking area
- Webhook source indication


4. Interactive Controls:
- Re-run button for tasks
- Status indicators (Queued, In progress)
- Expandable task cards
- Task creation interface
- Search functionality in header


5. Colors:
- Background: #13111A (dark purple)
- Sidebar: #1A1721
- Text: #FFFFFF
- Secondary text: #8A8F98
- Accent: #2D7FF9 (blue)
- Status indicators: #4D4D4D (queued)


6. Grid/Layout Structure:
- Two-column layout (sidebar + main)
- Vertical stack of task cards
- Nested hierarchy for task details
- Responsive container with min-width 1024px
</image_analysis>

<development_planning>

1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar
│   │   ├── Header
│   │   └── TaskContainer
│   ├── features/
│   │   ├── TaskList
│   │   ├── TaskCard
│   │   └── StatusIndicator
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
```


2. Key Features:
- Real-time task status updates
- Task creation and management
- Progress tracking
- Agent activity monitoring
- Webhook integration


3. State Management:
```typescript
interface AppState {
├── tasks: {
│   ├── currentTask: Task
│   ├── taskList: Task[]
│   ├── taskStatus: TaskStatus
│   └── taskHistory: TaskHistory[]
├── agent: {
│   ├── status: AgentStatus
│   ├── activities: Activity[]
│   └── configuration: AgentConfig
├── }
}
```


4. Routes:
```typescript
const routes = [
├── '/dashboard',
├── '/tasks/*',
├── '/agents/*',
└── '/configuration/*'
]
```


5. Component Architecture:
- TaskManager (parent)
- TaskList (container)
- TaskCard (presentation)
- StatusIndicator (shared)
- AgentActivity (container)


6. Responsive Breakpoints:
```scss
$breakpoints: (
├── 'sm': 640px,
├── 'md': 768px,
├── 'lg': 1024px,
└── 'xl': 1280px
);
```
</development_planning>
</frontend-prompt>

IMPORTANT: Please ensure that (1) all KEY COMPONENTS and (2) the LAYOUT STRUCTURE are fully implemented as specified in the requirements. Ensure that the color hex code specified in image_analysis are fully implemented as specified in the requirements.