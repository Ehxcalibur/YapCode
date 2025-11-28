import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// The native app expects "main" as the component name
AppRegistry.registerComponent('main', () => App);
