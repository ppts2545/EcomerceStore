// Barrel export for Header component
// This allows clean imports like: import { Header } from './components/Header'
// Instead of: import { Header } from './components/Header/Header'

export { default as Header } from './Header';
export type { HeaderProps } from './Header';

// Named export for convenience
export { Header as default } from './Header';
