import Foundation

class OnboardingViewModel: ObservableObject {
    @Published var currentStep: Int = 0
    
    func goToNextStep() {
        currentStep += 1
    }
    
}//
//  OnboardingViewModel.swift
//  Anchor - iosApp
//
//  Created by Pooja Raju on 11/8/25.
//

