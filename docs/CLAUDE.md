## Documentation philosophy

- Ensure consistent document context structure, format, and content.
- Ensure no duplicate content appears.
- Ensure conciseness without being verbose.

## Project Spec Template

When writing project specifications, follow this simple template:

```markdown
### [Module ID]. [Module Name] [Status Emoji] _[Implementation Status]_

**Purpose**: [One sentence describing what this module does]

**Functional Requirements**:

1. **[Feature Category]**

   - [Specific requirement 1]
   - [Specific requirement 2]
   - [Technical detail if needed]

2. **Business Logic**

   - [Core logic rule 1]
   - [Core logic rule 2]
   - **[Important aspect]**: [Details]

3. **Data Storage**

   - Table: `[table_name]`
     - Stores: [field1], [field2], [field3]
   - **Data integrity**: [Constraint or rule]

4. **UI Specifications**

   - Location: `[route/path]`
   - Component: [ComponentName]
   - **Design**: [Design principle applied]
   - **[UI Feature]**: [Description]

5. **Technical Implementation**
   - **[Technical aspect]**: [Implementation detail]
   - **Authentication**: [Auth requirement]
   - **Error handling**: [Error strategy]
```

### Status Emojis:

- ✅ Implemented
- 🔄 Planned (In roadmap)
- 📋 Future (Not in current roadmap)
- 🚧 In Progress
- ⚠️ Needs Enhancement
