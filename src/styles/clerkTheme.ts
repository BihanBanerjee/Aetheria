// Import the dark theme from @clerk/themes
import { dark } from '@clerk/themes';

export const aetheriaClerkTheme = {
  baseTheme: dark, 
  variables: {
    colorPrimary: "rgb(79, 70, 229)",         // Indigo that matches your gradient
    colorBackground: "transparent",           // Completely transparent background
    colorInputBackground: "rgba(255, 255, 255, 0.07)",
    colorInputText: "rgba(255, 255, 255, 0.9)",
    colorTextOnPrimaryBackground: "white",
    colorText: "rgba(255, 255, 255, 0.9)",
    colorTextSecondary: "rgba(147, 197, 253, 0.8)", // Light blue matching your tagline
    fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif", // Match your app font
    borderRadius: "0.75rem",                  // Slightly rounded corners like your other elements
    fontSize: "16px"
  },
  elements: {
    // Main card container - completely transparent with no backdrop filter
    card: {
      backgroundColor: "transparent",
      backdropFilter: "none",
      border: "none",
      boxShadow: "none",
    },
    // Root box - make sure it has no background or filters
    rootBox: {
      backgroundColor: "transparent",
      backdropFilter: "none",
    },
    // Card box - completely transparent
    cardBox: {
      backgroundColor: "transparent",
      backdropFilter: "none",
    },
    socialButtonsBlockButton: {
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "0.375rem",
      padding: "0.5rem",
      transition: "all 0.2s ease",
      "&:hover": {
        border: "2px solid rgba(255, 255, 255, 0.6)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        transform: "translateY(-1px)",
      }
    },
    // Header section
    headerTitle: {
      fontSize: "1.25rem",
      fontWeight: "600"
    },
    headerSubtitle: {
      color: "rgba(147, 197, 253, 0.8)" // Match your app's subtitle blue
    },
    // Form fields - these should have some background for readability
    formButtonPrimary: {
      backgroundColor: "rgba(79, 70, 229, 0.8)",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        backgroundColor: "rgba(79, 70, 229, 1)",
        transform: "translateY(-1px)",
        boxShadow: "0 6px 8px -1px rgba(0, 0, 0, 0.15)"
      },
      transition: "all 0.2s ease"
    },
    formButtonReset: {
      color: "rgba(147, 197, 253, 0.8)" // Light blue
    },
    // Form input fields with subtle background for readability
    formFieldInput: {
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "rgba(255, 255, 255, 0.9)",
      "&:focus": {
        borderColor: "rgba(79, 70, 229, 0.5)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.25)"
      }
    },
    // Input placeholder text
    formFieldInput__placeholder: {
      color: "rgba(255, 255, 255, 0.4)"
    },
    // Label text
    formFieldLabel: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "0.875rem",
      fontWeight: "500"
    },
    // Footer styles
    footer: {
      color: "rgba(255, 255, 255, 0.6)",
      fontSize: "0.875rem"
    },
    footerActionLink: {
      color: "rgba(147, 197, 253, 0.9)",
      "&:hover": {
        color: "rgb(147, 197, 253)"
      }
    },
    // Social buttons
    identityPreviewEditButton: {
      color: "rgba(79, 70, 229, 0.8)"
    },
    // Alert/error messages
    alert: {
      backgroundColor: "rgba(220, 38, 38, 0.1)",
      borderColor: "rgba(220, 38, 38, 0.2)",
      color: "rgba(252, 165, 165, 0.9)"
    }
  }
};