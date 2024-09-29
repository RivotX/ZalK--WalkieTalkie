/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    mode: 'light',
    text: '#11181C',
    disabledText: '#A9A9A9',
    reverseText: '#ECEDEE',
    background: '#f5f5f5',
    Softbackground: '#fff',
    reverseBackground: '#151718',
    tint: tintColorLight,
    reverseTint: tintColorDark,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    loading: '#e2e2e2',
    PrimaryPurple: 'purple-500',
    primarypurpleHEX: '#A855F7',
    modal_bg_color: 'white',
    modal_text_color: 'gray-700',
    modal_title_color: 'black',
    Modal_accept_button: 'blue-500',
    Modal_cancel_button: 'gray-300',
    RZ_connection_text_color: 'purple-500',
    FirstScreenbg: 'white',
    RZ_Gradient_1: '#5708A0',
    RZ_Gradient_2: '#9A4DFF',
    RZ_Gradient_3: '#D4A5FF',
    UserProfileModal_BG: '#f5f5f5',
  },

  dark: {
    mode: 'dark',
    text: '#ECEDEE',
    disabledText: '#A9A9A9',
    reverseText: '#11181C',
    background: '#121212',
    Softbackground: '#151718',
    reverseBackground: '#fff',
    tint: tintColorDark,
    reverseTint: tintColorLight,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    TabSeleccionado: 'black',
    loading: '#e2e2e2',
    PrimaryPurple: 'purple-600',
    primarypurpleHEX: '#9333EA',
    modal_bg_color: 'gray-800',
    modal_text_color: 'gray-300',
    modal_title_color: 'white',
    Modal_accept_button: 'blue-600',
    Modal_cancel_button: 'gray-600',
    RZ_connection_text_color: 'purple-500',
    FirstScreenbg: 'black',
    RZ_Gradient_1: '#2E0854',
    RZ_Gradient_2: '#4B0082',
    RZ_Gradient_3: '#6A0DAD',
    UserProfileModal_BG: 'black',
  },
};
