# SimpleStore

A React Native e-commerce application built with TypeScript, featuring comprehensive testing with **46 snapshot tests** and performance monitoring.

## Getting Started

### Prerequisites
- Node.js 18+
- React Native development environment
- Android Studio or Xcode

### Installation
```bash
npm install
cd ios && pod install && cd ..
```

### Running the App
```bash
npm start
npm run android  # or npm run ios
```

## Testing Strategy

The project implements a **hybrid testing approach** combining **snapshot testing** for visual consistency and **unit testing** for business logic, with **164 test cases** across **7 test suites** and **55 total snapshots**.

### Running Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm test -- -u           # Update snapshots when changes are intentional
```

### Test Categories & Coverage

#### **Snapshot Tests (55 total snapshots)**
Visual regression testing and data structure documentation:

- **`toastConfig.test.tsx`** - **12 snapshots**
  - React component rendering states
  - Toast notification variants (success, error, info)
  - Different prop combinations and edge cases

- **`OneSignalService.test.ts`** - **9 snapshots**
  - Push notification payload structures
  - Service response formats
  - Error handling scenarios

- **`UniversalLinkingService.test.ts`** - **8 snapshots**
  - URL generation patterns
  - Linking configuration objects
  - Deep linking validation results

- **`getTimeAgo.test.ts`** - **5 snapshots**
  - Time formatting output patterns
  - Edge cases and boundary conditions
  - Real-world timestamp scenarios

- **`CartContext.test.tsx`** - **6 snapshots**
  - Cart state management transitions
  - Toast notification patterns
  - AsyncStorage integration patterns

#### **Unit Tests**
Behavioral and functional testing:

- **`oneSignalApi.test.ts`** - **26 tests** (No snapshots - API behavior)
  - HTTP request/response handling
  - Error scenarios and network failures
  - Authentication and configuration

### Testing Philosophy

#### **When to Use Snapshots:**
- ✅ **React component rendering** - Visual consistency
- ✅ **Data structure documentation** - API payloads, configurations
- ✅ **Template outputs** - Email templates, formatted strings
- ✅ **State transitions** - Context state changes
- ✅ **Configuration objects** - URL patterns, settings

#### **When to Use Unit Tests:**
- ✅ **Business logic** - Calculations, validations
- ✅ **API behavior** - HTTP calls, error handling
- ✅ **User interactions** - Button clicks, form submissions
- ✅ **Error boundaries** - Exception handling
- ✅ **Integration points** - Service interactions

### Test Structure
```
src/
├── components/__tests__/     # React component tests
│   └── toastConfig.test.tsx
├── contexts/__tests__/       # Context state management tests
│   └── CartContext.test.tsx
├── services/__tests__/       # Business logic tests
│   ├── OneSignalService.test.ts
│   └── UniversalLinkingService.test.ts
├── utils/__tests__/         # Utility function tests
│   ├── getTimeAgo.test.ts
│   └── emailTemplates.test.ts
├── api/__tests__/           # API client tests
│   └── oneSignalApi.test.ts
├── __snapshots__/           # Generated snapshot files
├── jest.config.js          # Jest configuration
└── jest.setup.js           # Test environment setup
```

### Snapshot Management

#### **Updating Snapshots:**
```bash
# When component/data structure changes are intentional
npm test -- --updateSnapshot

# Update specific test snapshots
npm test toastConfig -- --updateSnapshot
npm test CartContext -- --updateSnapshot
```

#### **Reviewing Snapshot Changes:**
1. **Review the diff** to ensure changes are intentional
2. **Verify visual/structural integrity** 
3. **Update snapshots** if changes are correct
4. **Fix code** if changes indicate bugs

### Jest Configuration

Our testing setup includes:
- **React Native preset** with TypeScript support
- **Comprehensive mocking** for React Native modules
- **AsyncStorage** and **Toast** mocking
- **Animation mocking** for consistent snapshots
- **Custom snapshot serializers** for better formatting

## Performance Monitoring

The application includes built-in performance profiling tools:

- Component render time tracking
- API call performance monitoring
- Memory usage analysis
- Frame rate monitoring for animations

## Project Structure
```
src/
├── components/         # Reusable UI components
├── screens/           # Screen components  
├── navigation/        # Navigation configuration
├── services/          # Business logic and services
├── api/              # API clients and endpoints
├── utils/            # Utility functions
├── contexts/         # React Context providers
├── theme/            # Styling and themes
└── types/            # TypeScript definitions
```

## Technology Stack
- React Native 0.79.2
- TypeScript
- Jest & React Native Testing Library
- React Navigation
- OneSignal (Push notifications)
- AsyncStorage
- Vector Icons

## Key Features
- E-commerce product management
- Push notification system
- Deep linking support
- Theme switching
- Comprehensive cart management
- Performance monitoring
- Email template generation
- Comprehensive error handling

## Development

### Testing Best Practices
- **Hybrid testing strategy** combining snapshots and unit tests
- **Visual regression prevention** through component snapshots
- **Data structure documentation** via service snapshots
- **Comprehensive error scenario coverage**
- **Mock strategies** for external dependencies
- **Performance and edge case testing**

### Code Quality
- TypeScript strict mode
- ESLint configuration
- **55 total snapshots** for visual/structural consistency
- **164 total test cases** with comprehensive coverage
- Performance optimization
- Consistent testing patterns across the codebase

### Contributing

When adding new features:
1. **Add appropriate tests** (unit tests for logic, snapshots for structures)
2. **Update snapshots** when visual/structural changes are intentional
3. **Follow established testing patterns** based on the component type
4. **Ensure comprehensive coverage** of edge cases and error scenarios

---

## Test Summary
- **Total Test Suites:** 6
- **Total Test Cases:** 135
- **Total Snapshots:** 40
- **Testing Strategy:** Hybrid (Snapshot + Unit)
- **Coverage:** Components, Services, Utils, APIs, Contexts

## Environment Configuration

This project uses environment variables to manage configuration for different stages (development, staging, production) via [react-native-config](https://github.com/luggit/react-native-config).

### Available Environment Files
- `.env` (default)
- `.env.development`
- `.env.staging`
- `.env.production`

Each file contains variables such as:
API_BASE_URL
GOOGLE_PLACES_API_BASE_URL
GOOGLE_MAPS_API_KEY
ONESIGNAL_APP_ID
ONESIGNAL_REST_API_KEY
DEBUG_MODE=true|false
LOG_LEVEL=debug|info|error
ENVIRONMENT=development|staging|production


### Selecting an Environment
By default, the app uses `.env` (set in `android/gradle.properties` as `ENVFILE=.env`).

To use a different environment:
1. Open `android/gradle.properties`.
2. Change the line to one of the following:
   - `ENVFILE=.env.development`
   - `ENVFILE=.env.staging`
   - `ENVFILE=.env.production`

