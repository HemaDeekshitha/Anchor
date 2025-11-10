//
//  ContentView.swift
//  Anchor - iosApp
//
//  Created by Pooja Raju on 11/8/25.
//

import SwiftUI

struct ContentView: View {
    var viewModel: OnboardingViewModel

    var body: some View {
        NavigationStack {
            OnboardingWelcomeView(viewModel: viewModel)
        }
    }
}
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(viewModel: OnboardingViewModel())
    }
}


