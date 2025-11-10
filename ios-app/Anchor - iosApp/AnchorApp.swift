import SwiftUI

@main
struct AnchorApp: App {
    @StateObject var onboardingVM = OnboardingViewModel()

    init() {
        // UIKit fallback to ensure tint color always applies
        UINavigationBar.appearance().tintColor = UIColor(Color.yellow)
    }

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                OnboardingWelcomeView(viewModel: onboardingVM)
            }
            .tint(AppColors.navigationTint)       // SwiftUI way
            .accentColor(AppColors.navigationTint) // extra safety for iOS 16/17
        }
    }
}
