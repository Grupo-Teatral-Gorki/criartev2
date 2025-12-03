# Testing Guide for Proponentes Form

## Setup

To run the tests for the Pessoa Física form, you need to install the required testing dependencies first:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest
```

## Running Tests

Once dependencies are installed, you can run the tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test page.test.tsx
```

## Test Coverage

The test file `app/(main)/proponentes/novo/fisica/page.test.tsx` covers:

### 1. **Form Rendering**
- ✅ Renders form with correct title
- ✅ Displays all step indicators
- ✅ Shows back button
- ✅ Renders fields for current step

### 2. **Form Navigation**
- ✅ Navigate forward through steps
- ✅ Navigate backward through steps
- ✅ Disable "Anterior" button on first step
- ✅ Show "Finalizar Cadastro" on last step

### 3. **Form Input Handling**
- ✅ Handle text input changes
- ✅ Handle select dropdown changes
- ✅ Handle multiselect checkbox selections
- ✅ Handle multiple multiselect options
- ✅ Uncheck multiselect options

### 4. **Form Submission**
- ✅ Show error if user not authenticated
- ✅ Show error if city not found
- ✅ Save proponente with correct data structure
- ✅ Convert multiselect values to arrays
- ✅ Show success message and redirect
- ✅ Show error message if save fails
- ✅ Disable submit button while saving

### 5. **Data Persistence**
- ✅ Maintain form data when navigating between steps

### 6. **Back Navigation**
- ✅ Navigate back to proponentes list

## Test Structure

The tests use:
- **Jest** as the test runner
- **React Testing Library** for component testing
- **Mock functions** for external dependencies (Firebase, routing, etc.)

## Key Features Tested

### Multiselect Functionality
The tests verify that multiselect fields:
- Render as checkbox lists
- Allow multiple selections
- Store values as comma-separated strings internally
- Convert to arrays before Firebase submission

### Firebase Integration
The tests verify that:
- Data is organized by sections (dadosPessoais, contato, endereco, etc.)
- User and city information is included
- Multiselect values are converted to arrays
- Success/error handling works correctly

### Form State Management
The tests verify that:
- Form data persists across step navigation
- All fields are initialized with empty values
- Input changes update the form state correctly

## Adding More Tests

To add tests for Pessoa Jurídica or Coletivo forms, create similar test files:
- `app/(main)/proponentes/novo/juridica/page.test.tsx`
- `app/(main)/proponentes/novo/coletivo/page.test.tsx`

Follow the same structure and patterns used in the Pessoa Física tests.

## Troubleshooting

If tests fail:
1. Ensure all dependencies are installed
2. Check that mock data matches your form structure
3. Verify Firebase service methods are properly mocked
4. Check console for detailed error messages

## CI/CD Integration

To run tests in CI/CD pipelines, add to your workflow:

```yaml
- name: Run tests
  run: npm test -- --ci --coverage --maxWorkers=2
```

## Notes

- Tests use simplified mock data for faster execution
- Real Firebase connections are mocked to avoid external dependencies
- Tests focus on user interactions and data flow, not styling
- Coverage reports are generated in the `coverage/` directory
