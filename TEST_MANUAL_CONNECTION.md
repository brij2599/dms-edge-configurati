# Manual Connection Test Documentation

## Test Setup

### Objective
Test the manual connection functionality between two nodes in the DMS workflow builder.

### Test Nodes Added
1. **Test Node 1**
   - ID: `test-node-1`
   - Type: `webhook`
   - Position: (200, 200)
   - Color: Red (#ec4a3f)
   - Icon: Globe

2. **Test Node 2**
   - ID: `test-node-2`
   - Type: `ai-transform`
   - Position: (450, 200)
   - Color: Purple (#8b5cf6)
   - Icon: Sparkle

### Test Functionality

#### 1. Manual Connection Test Button
- Located in the debug panel (top-right corner)
- Only appears when 2 or more nodes exist
- **Action**: Connects the first two nodes in the workflow
- **Expected Result**: Creates a connection from `test-node-1` → `test-node-2`

#### 2. Clear Connections Button
- Clears all existing connections for testing purposes
- Allows re-testing the connection functionality

#### 3. Debug Information Display
- Shows current node count
- Shows current connection count
- Shows connection source state
- Shows recent connections (last 3)

### Expected Behavior

1. **Initial State**: Two test nodes visible, no connections
2. **After Connection Test**: Red curved line with arrow from webhook to AI transform node
3. **Debug Panel Updates**: Connection count increases to 1, shows connection details

### Console Logging

The test includes comprehensive console logging:
- Connection creation process
- State before and after updates
- Validation of node existence
- Connection rendering details

### Test Cases

1. **Basic Connection**: Click "Test Connect First 2 Nodes" → Should see visual connection
2. **Duplicate Prevention**: Click test button again → Should not create duplicate
3. **Clear and Reconnect**: Clear connections → Test again → Should create new connection
4. **Visual Rendering**: Connection should be visible as red curved line with arrowhead

### Troubleshooting

If connections are not visible:
1. Check console for debugging logs
2. Verify both nodes exist in workflow state
3. Confirm connection is created in state but not rendering
4. Check Connections component for rendering issues