# YaP Code

<div align="center">

![YaP Code Banner](assets/images/icon.png)

**A sleek, modern, and open-source mobile IDE for Android**

Designed with a "Void & Violet" aesthetic for distraction-free coding on the go

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-black.svg)](https://expo.dev/)

</div>

---

## ✨ Features

- 🎨 **Void & Violet Theme** - Deep, high-contrast dark mode designed for extended coding sessions
- 🔤 **Syntax Highlighting** - Real-time syntax highlighting for Python and JavaScript with keyword, string, comment, and function detection
- 📁 **File Management** - Create, open, and save files directly on your device with support for both internal storage and external directories via Storage Access Framework (SAF)
- 💻 **Terminal Simulation** - Built-in terminal for viewing JavaScript execution output and Python script simulation
- ⚡ **Lightweight** - Optimized React Native build with minimal dependencies for fast performance
- 📱 **Mobile-Optimized** - Custom keyboard toolbar with quick access to coding symbols (\`{}\`, \`[]\`, \`()\`, \`;\`, etc.)
- 🔍 **Smart Editor** - Overlay-based syntax highlighter with transparent input layer for accurate cursor positioning

## 🛠️ Tech Stack

### Core Framework
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | [React Native](https://reactnative.dev/) 0.81 | Cross-platform mobile development |
| Runtime | [Expo](https://expo.dev/) ~54.0 | Development and build tooling |
| Language | JavaScript/TypeScript | Application logic |
| UI Components | React Native Core | Native UI rendering |

### Libraries & Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| \`expo-file-system\` | ~19.0.19 | File operations and Storage Access Framework |
| \`expo-splash-screen\` | ~0.29.23 | Splash screen management |
| \`lucide-react-native\` | ^0.469.0 | Modern icon system |
| \`react-native-safe-area-context\` | 5.0.1 | Safe area handling for notches/bars |

### Build Tools
| Tool | Version | Purpose |
|------|---------|---------|
| Gradle | 8.8 | Android build system |
| Android NDK | 27.1.12297006 | Native code compilation |
| Android Build Tools | 36.0.0 | APK assembly |
| Target SDK | 36 (Android 15) | Latest Android features |
| Min SDK | 24 (Android 7.0) | Compatibility baseline |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting and style enforcement |
| TypeScript | Type checking and IntelliSense |
| Metro | JavaScript bundler for React Native |

## 🏗️ Architecture

YaP Code uses an innovative overlay-based syntax highlighting approach:

1. **TextInput Layer (Bottom)** - Handles user input with text color matching the background for invisibility
2. **Syntax Highlight Layer (Top)** - Displays colored syntax parsing with \`pointerEvents="none"\` to allow clicks to pass through
3. **Cursor Management** - Custom cursor color and selection highlighting for visibility

This architecture provides:
- Real-time syntax highlighting without lag
- Accurate cursor positioning
- Native text input behavior
- Professional IDE appearance

## 📋 Prerequisites

Before building YaP Code, ensure you have the following installed:

### Required Software
- **Node.js** (LTS version 18.x or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Java Development Kit (JDK)** 17 or higher - [Download](https://adoptium.net/)

### Android Development Setup
- **Android SDK** with the following components:
  - Build Tools 36.0.0
  - Platform SDK 36 (Android 15)
  - NDK 27.1.12297006
  - Android SDK Platform-Tools
  - Android SDK Command-line Tools

> **Quick Test**: For testing without building, install [Expo Go](https://expo.dev/client) on your Android device

## 🚀 Quick Start (Development)

Get YaP Code running in development mode:

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/yourusername/yap-code.git
cd YapCode

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start
\`\`\`

Scan the QR code with the **Expo Go** app on your Android device to test the app.

### Development Mode Features
- Live reload on code changes
- React Developer Tools integration
- Chrome DevTools debugging
- Network request inspection

## 🏗️ Building for Android

### Complete Build Process

Follow these comprehensive steps to build a production-ready APK:

#### Step 1: Install Android SDK

Set up the Android SDK if you haven't already:

\`\`\`bash
# Create SDK directory
mkdir -p ~/Android/Sdk

# Set environment variables (add to ~/.bashrc or ~/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/build-tools/36.0.0:$PATH

# Reload shell configuration
source ~/.bashrc  # or source ~/.zshrc
\`\`\`

**Install required components using sdkmanager:**

\`\`\`bash
# Accept licenses first
yes | sdkmanager --licenses

# Install SDK components
yes | sdkmanager "platform-tools" \\
    "platforms;android-36" \\
    "build-tools;36.0.0" \\
    "ndk;27.1.12297006" \\
    "cmdline-tools;latest"
\`\`\`

**Verify installation:**
\`\`\`bash
sdkmanager --list | grep "build-tools;36"
\`\`\`

#### Step 2: Generate Native Android Project

This step creates the \`android\` directory with all native code:

\`\`\`bash
# Generate Android project from Expo config
npx expo prebuild --platform android --clean

# This command:
# - Creates android/app directory
# - Generates gradle build files
# - Configures AndroidManifest.xml
# - Sets up app icons and splash screens
\`\`\`

#### Step 3: Configure Build Settings

Before building, verify these configuration files:

**android/gradle.properties**
\`\`\`properties
# Increase memory allocation for build
org.gradle.jvmargs=-Xmx6g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError
org.gradle.daemon=false

# Android settings
android.useAndroidX=true
android.enableJetifier=true
\`\`\`

**android/local.properties**
\`\`\`properties
# Set your SDK location
sdk.dir=/home/youruser/Android/Sdk
\`\`\`

#### Step 4: Build the APK

Choose between **Debug** or **Release** build:

##### Debug Build (for testing)
\`\`\`bash
cd android
./gradlew assembleDebug

# Output location
ls -lh app/build/outputs/apk/debug/app-debug.apk
\`\`\`

**Debug build characteristics:**
- Includes debugging symbols
- Not optimized
- Requires development server for some features
- Larger file size (~50-80 MB)

##### Release Build (recommended for distribution)
\`\`\`bash
cd android
./gradlew assembleRelease

# Output location
ls -lh app/build/outputs/apk/release/app-release.apk
\`\`\`

**Release build characteristics:**
- Optimized and minified
- Standalone (no dev server needed)
- Smaller file size (~20-30 MB)
- Production-ready

> **Note**: The release build is signed with a debug keystore by default. For Google Play Store distribution, configure a proper signing key in \`android/app/build.gradle\`.

#### Step 5: Install the APK

Transfer the APK to your Android device and install, or use ADB:

\`\`\`bash
# Via ADB (device must be connected)
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Via file transfer
# Copy the APK to your device and tap to install
# You may need to enable "Install unknown apps" in Settings
\`\`\`

### Clean Build

If you encounter issues, perform a clean build:

\`\`\`bash
cd android
./gradlew clean
./gradlew assembleRelease
\`\`\`

## ⚙️ Advanced Configuration

### Memory Optimization

For systems with limited RAM, adjust Gradle memory:

**android/gradle.properties**
\`\`\`properties
# Reduce memory allocation
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
\`\`\`

### Build Variants

YaP Code supports multiple build variants:

\`\`\`bash
# List all available variants
cd android
./gradlew tasks --all | grep assemble

# Build specific variant
./gradlew assembleDebug
./gradlew assembleRelease
\`\`\`

## 🐛 Troubleshooting

<details>
<summary><b>Build fails with "No space left on device"</b></summary>

Clear Gradle cache and temporary files:
\`\`\`bash
rm -rf ~/.gradle/caches
rm -rf ~/.gradle/daemon
rm -rf android/app/build
rm -rf android/build
\`\`\`

Check available disk space:
\`\`\`bash
df -h
\`\`\`
</details>

<details>
<summary><b>App crashes on startup</b></summary>

1. Check you built a **Release** APK, not Debug
2. Verify all permissions are granted in Android Settings
3. Check logcat for errors:
\`\`\`bash
adb logcat | grep -i error
\`\`\`
</details>

<details>
<summary><b>SDK location not found error</b></summary>

Create \`android/local.properties\` with:
\`\`\`properties
sdk.dir=/home/youruser/Android/Sdk
\`\`\`
Replace \`/home/youruser\` with your actual home directory path.

Verify SDK path:
\`\`\`bash
echo $ANDROID_HOME
\`\`\`
</details>

<details>
<summary><b>Gradle build fails with memory errors</b></summary>

Increase memory allocation in \`android/gradle.properties\`:
\`\`\`properties
org.gradle.jvmargs=-Xmx8g -XX:MaxMetaspaceSize=1g
\`\`\`

Or run with more memory:
\`\`\`bash
./gradlew assembleRelease -Dorg.gradle.jvmargs="-Xmx8g"
\`\`\`
</details>

## 📱 Features in Detail

### File Management
- **Create**: New Python (\`.py\`) and JavaScript (\`.js\`) files with templates
- **Open**: Browse and open files from internal storage or external directories
- **Save**: Auto-save with visual confirmation in terminal
- **Storage Access Framework**: Request permissions for external storage access on Android

### Syntax Highlighting
- **Keywords**: \`def\`, \`if\`, \`while\`, \`const\`, \`let\`, \`function\`, etc.
- **Strings**: Single and double-quoted strings with escape sequence support
- **Comments**: \`#\` (Python) and \`//\` (JavaScript) style comments
- **Functions**: Function name detection before parentheses

### Code Execution
- **JavaScript**: Real-time execution with console.log output capture
- **Python**: Simulated execution with print statement parsing
- **Terminal**: Scrollable output with color-coded success/error messages

## 🗺️ Roadmap

- [ ] Python runtime via Chaquopy or similar
- [ ] Additional language support (HTML, CSS, JSON)
- [ ] Git integration
- [ ] Package manager integration (pip, npm)
- [ ] Autocomplete and IntelliSense
- [ ] Multi-file project support
- [ ] Cloud sync capabilities

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (\`git checkout -b feature/AmazingFeature\`)
3. **Commit** your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. **Push** to the branch (\`git push origin feature/AmazingFeature\`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style (use ESLint)
- Test on physical Android devices
- Update README for new features
- Keep commits atomic and well-described

## 📊 Project Structure

\`\`\`
YapCode/
├── App.js                 # Main application component
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── assets/               # Images and static files
├── components/           # Reusable UI components
├── constants/            # Theme and configuration
├── hooks/                # Custom React hooks
└── android/              # Native Android project (generated)
    ├── app/
    │   ├── build.gradle  # App-level build config
    │   └── src/          # Android source code
    └── build.gradle      # Project-level build config
\`\`\`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Inspired by VS Code, Sublime Text, and modern mobile development tools
- Special thanks to the React Native and Expo communities

---

<div align="center">

**Built with ❤️ by YaPLabs**

[Report Bug](https://github.com/yourusername/yap-code/issues) · [Request Feature](https://github.com/yourusername/yap-code/issues)

Made for developers who code on the go 🚀

</div>
