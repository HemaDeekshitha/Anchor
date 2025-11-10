import SwiftUI

struct AppColors {
    static let primary = Color.yellow
    static let accent = Color.blue
    static let background = Color.yellow
    static let text = Color.black
    static let navigationTint = Color.yellow //navigation back arrow
}

struct AppFonts {
    static let heading = Font.system(size: 28, weight: .bold)
    static let subheading = Font.system(size: 18, weight: .medium)
    static let body = Font.system(size: 16)
    static let button = Font.system(size: 17, weight: .semibold)
    
}

struct AppSpacing {
    static let small: CGFloat = 8
    static let medium: CGFloat = 16
    static let large: CGFloat = 32
    static let xLarge: CGFloat = 48
}

