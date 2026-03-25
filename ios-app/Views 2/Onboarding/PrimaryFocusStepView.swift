//
//  PrimaryFocusStepView.swift
//  Anchor - iosApp
//
//  Created by Pooja Raju on 11/8/25.
//

// 1. PrimaryFocusView.swift
import SwiftUI

struct PrimaryFocusView: View {
    @State private var selected: Set<String> = []
    @State private var navigate = false
    @State private var goToCurrentStatus = false
    @State private var skipToFinal = false
    let options = ["Find a new job", "Switch careers", "Get promoted", "Learn new skills", "Network more", "Prepare for interviews"]

    var body: some View {
        VStack(spacing: 16) {
            Spacer().frame(height: 0)
            // Top right Skip
                       HStack {
                           Spacer()
                           Button("Skip") {
                               skipToFinal = true
                           }
                           .foregroundColor(.purple)
                       }
            Text("What's your primary focus?")
                .font(.title.bold())
            Text("Select all that apply")
                .foregroundColor(.gray)

            ForEach(options, id: \.self) { item in
                Button(action: {
                    if selected.contains(item) {
                        selected.remove(item)
                    } else {
                        selected.insert(item)
                    }
                }) {
                    Text(item)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .foregroundColor(.yellow.opacity(0.8))
                        .bold()

                        .background(selected.contains(item) ? Color.yellow.opacity(0.1) : Color.white)
                        .overlay(RoundedRectangle(cornerRadius: 25).stroke(selected.contains(item) ? Color.yellow : Color.gray.opacity(0.35), lineWidth: selected.contains(item) ? 3.5 : 3))
                        .cornerRadius(25)
                }
            }

            Spacer()
            // Pagination Dots
            HStack(spacing: 8) {
                ForEach(0..<5) { index in
                    Circle()
                        .fill(index == 2 ? Color.yellow : Color.gray.opacity(0.3))
                        .frame(width: 8, height: 8)
                }
            }

            Button("Continue") {
                goToCurrentStatus = true
            }
            .disabled(selected.isEmpty)
            .frame(maxWidth: .infinity)
            .padding()
            .background(selected.isEmpty ? Color.gray.opacity(0.4) : Color.yellow)
            .foregroundColor(.white)
            .cornerRadius(30)

            NavigationLink(destination: CurrentStatusView(), isActive: $goToCurrentStatus) {
                EmptyView()
            }
            NavigationLink(destination: CurrentStatusView(), isActive: $skipToFinal) {
                            EmptyView()
                        }.hidden()
        }
        .padding()
    }
}
