# Validation Strategy Guide

## Recommended Approach: **Hybrid Strategy**

### **For Critical User-Facing Features (Auth, Forms, Payments):**
✅ **Add validation immediately** - These directly impact user experience and security
- Client-side validation for instant feedback
- Server-side error handling with user-friendly messages
- Field-level error display

### **For Less Critical Features (Listings, Details, Reports):**
⏳ **Add validation later** - Can batch this work after core functionality is complete
- Basic error handling (show generic error messages)
- Detailed validation can be added in a later pass

---

## What We've Implemented (Example Pattern)

### 1. **Error Handling Utility** (`utils/errorHandler.ts`)
- Extracts user-friendly messages from API errors
- Handles different error response formats
- Provides status-code-based fallback messages
- Supports field-specific validation errors

### 2. **Client-Side Validation**
- Immediate feedback before API call
- Prevents unnecessary network requests
- Better user experience

### 3. **Server-Side Error Handling**
- Parses API error responses
- Shows field-specific errors when available
- Falls back to general error messages

### 4. **Visual Feedback**
- Red borders on invalid fields
- Error messages below each field
- General error banner at top of form

---

## Pattern to Follow for Other APIs

```typescript
// 1. Import error utilities
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler';

// 2. Add state for errors
const [error, setError] = useState<string | null>(null);
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

// 3. Add client-side validation function
const validateForm = (): boolean => {
  const errors: Record<string, string> = {};
  // ... validation logic
  setFieldErrors(errors);
  return Object.keys(errors).length === 0;
};

// 4. In submit handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setFieldErrors({});

  // Client-side validation first
  if (!validateForm()) {
    return;
  }

  try {
    // API call
  } catch (err) {
    const errorMessage = getErrorMessage(err);
    const fieldErrs = getFieldErrors(err);
    
    if (Object.keys(fieldErrs).length > 0) {
      setFieldErrors(fieldErrs);
    } else {
      setError(errorMessage);
    }
  }
};

// 5. In JSX - show field errors
<input
  className={`... ${fieldErrors.fieldName ? 'border-rose-500' : ''}`}
/>
{fieldErrors.fieldName && (
  <p className="text-xs text-rose-600">{fieldErrors.fieldName}</p>
)}
```

---

## Priority Order for Validation

### **Phase 1: Critical (Do Now)**
1. ✅ Authentication (Login/Register) - **DONE**
2. Product Creation/Edit forms
3. Loan Application forms
4. Disbursement forms

### **Phase 2: Important (After Core APIs)**
5. Approval workflows
6. Settings forms
7. User management forms

### **Phase 3: Nice to Have (Polish)**
8. Search/filter inputs
9. Date range pickers
10. File uploads

---

## Benefits of This Approach

✅ **Faster initial development** - Get APIs working first
✅ **Better user experience** - Critical forms have validation from the start
✅ **Reusable pattern** - Same error handling utility for all forms
✅ **Maintainable** - Consistent validation approach across the app
✅ **Flexible** - Can add detailed validation later without breaking existing code

---

## Next Steps

1. **Continue integrating APIs** for Products, Loans, Disbursements
2. **Add basic error handling** (using `getErrorMessage`) for all API calls
3. **Add detailed validation** to forms as you build them (using the pattern above)
4. **Batch validation improvements** in a later pass for non-critical features
