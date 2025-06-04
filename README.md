# SimpleStore

A React Native e-commerce application built with TypeScript, featuring comprehensive testing and performance monitoring.

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

## Testing

The project includes comprehensive unit tests with 119 test cases across 5 test suites.

### Running Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Test Coverage
- **toastConfig**: Component configuration testing (12 tests)
- **UniversalLinkingService**: Deep linking and URL handling (25 tests)
- **OneSignalService**: Push notification service logic (23 tests)
- **getTimeAgo**: Date/time utility functions (33 tests)
- **oneSignalApi**: External API client testing (26 tests)

### Test Structure
```
src/
├── components/__tests__/
├── services/__tests__/
├── utils/__tests__/
├── api/__tests__/
├── jest.config.js
└── jest.setup.js
```

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
- Performance monitoring
- Comprehensive error handling

## Development

### Testing Principles
- Unit tests for all key components and services
- Comprehensive error scenario coverage
- Mock strategies for external dependencies
- Performance and edge case testing

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Comprehensive test coverage
- Performance optimization