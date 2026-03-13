# Front-end drag and drop sorting debugging guide

## Problem confirmation

Through backend diagnostics, we confirmed the following:
- ✅ Backend API is fully working properly
- ✅ All API endpoints respond correctly
- ✅ The database data is correct
- ❌ The front-end did not issue an API request (no record in the back-end log)

## Problem location

**The problem occurs in the front end! ** The front-end drag-and-drop sorting function does not trigger API calls correctly.

## Front-end debugging steps

### 1. Open the browser developer tools

1. Open the project details page in the browser
2. Press`F12`Or right click → "Inspect Element" to open developer tools
3. Switch to the **Network** tab
4. Make sure to record the network request (the red record button should be active)

### 2. Check whether the drag function is triggered

1. Try dragging clips in the collection
2. Observe whether there are new API requests on the **Network** tab.
3. If there is no API request, it means that the drag event is not handled correctly.

### 3. Check for JavaScript errors

1. Switch to the **Console** tab
2. Try drag-and-drop sorting operation
3. Check if there is a red error message
4. Record error information for further diagnosis

### 4. Check whether the component is rendered correctly

1. Check the collection component in the **Elements** tab
2. Confirm whether the drag-related event handler is correctly bound
3. Check whether the props and state of the component are correct

## Possible causes of the problem

### 1. Drag and drop library problem

**Symptoms**: Drag operation has no effect and no visual feedback
**examine**:
- Confirm whether a drag and drop library (such as react-dnd, @dnd-kit, etc.) is used
- Check drag and drop library version compatibility
- Check whether the drag and drop library is configured correctly

### 2. The event handler is not bound

**Symptom**: Can be dragged but no callback is triggered
**examine**:
- examine`onReorderClips`Wait for the callback function to be passed correctly
- Confirm whether the component's props are received correctly

### 3. Status management issues

**Symptom**: Status is not updated after dragging
**examine**:
- Check the store`reorderCollectionClips`Whether the method is called
- add at the beginning of the method`console.log`Confirm execution

### 4. API call intercepted

**Symptoms**: The front-end code executes but the API request is not sent.
**examine**:
- Check axios configuration
- Check if there is a problem with the request interceptor
- Confirm that the network connection is normal

## Specific debugging code

### Add debug log in CollectionPreviewModal.tsx

```typescript
const handleReorderClips = async (newClipIds: string[]) => {
  console.log('🔄 handleReorderClips called with:', newClipIds)
  
  try {
    console.log('📤 Calling onReorderClips...')
    await onReorderClips?.(collection.id, newClipIds)
    console.log('✅ onReorderClips completed successfully')
    
    message.success('合集顺序已更新')
  } catch (error) {
    console.error('❌ onReorderClips failed:', error)
    message.error('更新合集顺序失败')
  }
}
```

### Add debug logs in useProjectStore.ts

```typescript
reorderCollectionClips: async (projectId: string, collectionId: string, newClipIds: string[]) => {
  console.log('🎯 reorderCollectionClips called:', { projectId, collectionId, newClipIds })
  
  // ... 现有代码 ...
  
  try {
    console.log('📤 Calling projectApi.reorderCollectionClips...')
    await projectApi.reorderCollectionClips(projectId, collectionId, newClipIds)
    console.log('✅ API call successful')
  } catch (error) {
    console.error('❌ API call failed:', error)
    // ... 错误处理 ...
  }
}
```

### Add debug log in api.ts

```typescript
reorderCollectionClips: (projectId: string, collectionId: string, clipIds: string[]): Promise<Collection> => {
  console.log('🌐 API call: reorderCollectionClips', { projectId, collectionId, clipIds })
  
  const url = `/projects/${projectId}/collections/${collectionId}/reorder`
  console.log('📡 Request URL:', url)
  console.log('📦 Request data:', clipIds)
  
  return api.patch(url, clipIds)
}
```

## Quick test method

Test the API call directly in the browser console:

```javascript
// 1. 测试store方法
window.useProjectStore.getState().reorderCollectionClips(
  '86f9aa12-2f35-4618-b265-74b3d9a4cf2d',
  '5e5dafc8-f29a-4705-8e87-b2bb06f2a5de', 
  ['3d0bb0b6-dd8d-4105-9219-b1bce74c7b4a', '678a8c4b-16ac-4893-a8d9-1b28c3bb4c81']
)

// 2. 直接测试API调用
fetch('http://localhost:8000/api/v1/projects/86f9aa12-2f35-4618-b265-74b3d9a4cf2d/collections/5e5dafc8-f29a-4705-8e87-b2bb06f2a5de/reorder', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(['678a8c4b-16ac-4893-a8d9-1b28c3bb4c81', '3d0bb0b6-dd8d-4105-9219-b1bce74c7b4a'])
}).then(r => r.json()).then(console.log)
```

## Expected results

If everything is fine, you should see:

1. **Network tab**: Appears`/projects/.../collections/.../reorder`PATCH request
2. **Console tab**: See related debug log output
3. **Response**: Received`{"message": "Collection clips reordered successfully", "clip_ids": [...]}`
4. **UI update**: The order of clips in the collection is updated immediately

## Next action

1. Follow the above steps to debug
2. Record the error information found
3. Locate the specific problem based on the error message
4. Fix problems in front-end code

## Contact support

If following this guide does not resolve the issue, please provide:
- Browser console error messages
- Screenshot of the request record of the Network tab
- Detailed description of operation steps

