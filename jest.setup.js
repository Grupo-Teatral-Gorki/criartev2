// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

// Polyfill fetch for Firebase
global.fetch = jest.fn()
global.Request = jest.fn()
global.Response = jest.fn()
global.Headers = jest.fn()

// Mock lucide-react to avoid ES module issues
jest.mock('lucide-react', () => ({
    ChevronLeft: (props) => React.createElement('span', { 'data-testid': 'icon-chevron-left', ...props }),
    ChevronRight: (props) => React.createElement('span', { 'data-testid': 'icon-chevron-right', ...props }),
    ArrowLeft: (props) => React.createElement('span', { 'data-testid': 'icon-arrow-left', ...props }),
    X: (props) => React.createElement('span', { 'data-testid': 'icon-x', ...props }),
    Upload: (props) => React.createElement('span', { 'data-testid': 'icon-upload', ...props }),
    Check: (props) => React.createElement('span', { 'data-testid': 'icon-check', ...props }),
    AlertCircle: (props) => React.createElement('span', { 'data-testid': 'icon-alert-circle', ...props }),
    Eye: (props) => React.createElement('span', { 'data-testid': 'icon-eye', ...props }),
    EyeOff: (props) => React.createElement('span', { 'data-testid': 'icon-eye-off', ...props }),
    Loader2: (props) => React.createElement('span', { 'data-testid': 'icon-loader2', ...props }),
}))
