//
//  CurrentStatusView.swift
//  Anchor - iosApp
//
//  Created by Pooja Raju on 11/8/25.
//

// 2. CurrentStatusView.swift
import SwiftUI

struct CurrentStatusView: View {
    @State private var selected: String? = nil
    @State private var navigate = false
    @State private var goToPreferences = false
    @State private var skipToFinal = false

    let options = [
        "Working full-time",
        "Working part-time",
        "Unemployed",
        "Student",
        "Freelancer",
        "Other"
    ]

    var body: some View {
        VStack(spacing: 16) {
            Spacer().frame(height: 5)
            
            // Top right Skip
                        HStack {
                            Spacer()
                            Button("Skip") {
                                skipToFinal = true
                            }
                            .foregroundColor(.purple)
                        }


            Text("What's your current status?")
                .font(.title.bold())
                .frame(maxWidth: .infinity, alignment: .leading)

            Text("Select one")
                .foregroundColor(.gray)
                .frame(maxWidth: .infinity, alignment: .leading)

            ForEach(options, id: \.self) { item in
                Button(action: {
                    selected = item
                }) {
                    Text(item)
                        .frame(maxWidth: .infinity)
                        .foregroundColor(.yellow.opacity(0.8))
                        .bold()
                        .padding()
                        .background(selected == item ? Color.purple.opacity(0.1) : Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 25)
                                .stroke(selected == item ? Color.yellow : Color.gray.opacity(0.2), lineWidth: 2)
                        )
                        .cornerRadius(25)
                }
            }

            Spacer()
            // Pagination Dots
            HStack(spacing: 8) {
                ForEach(0..<5) { index in
                    Circle()
                        .fill(index == 3 ? Color.yellow : Color.gray.opacity(0.3))
                        .frame(width: 8, height: 8)
                }
            }

            Button("Continue") {
                goToPreferences = true
            }
            .disabled(selected == nil)
            .frame(maxWidth: .infinity)
            .padding()
            .background(selected == nil ? Color.gray.opacity(0.4) : Color.yellow)
            .foregroundColor(.white)
            .cornerRadius(30)

            NavigationLink(destination: PreferencesView(), isActive: $goToPreferences) {
                EmptyView()
            }
            .hidden()
            NavigationLink(destination: PreferencesView(), isActive: $skipToFinal) {
                            EmptyView()
                        }.hidden()
        }
        .padding()
    }
}
