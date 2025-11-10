//
//  FinalOnboardingView.swift
//  Anchor - iosApp
//
//  Created by Pooja Raju on 11/8/25.
//
import SwiftUI

struct FinalOnboardingView: View {
    @State private var showContent = false
    @State private var navigateToDashboard = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Animated Checkmark
            Image(systemName: "checkmark.circle.fill")
                .resizable()
                .frame(width: 80, height: 80)
                .foregroundColor(.white)
                .background(
                    Circle()
                        .fill(
                            
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(red: 1.0, green: 0.976, blue: 0.77),  // #FFF9C4 (light yellow)
                                        Color(red: 1.0, green: 0.909, blue: 0.51),  // #FFE082 (medium)
                                        Color(red: 1.0, green: 0.835, blue: 0.31)   // #FFD54F (warm golden)
                                    ]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 120, height: 120)
                        .shadow(color: Color.yellow.opacity(0.6), radius: 15, x: 0, y: 6)
                )
                .scaleEffect(showContent ? 1 : 0.3)
                .opacity(showContent ? 1 : 0)
                .animation(.spring(response: 0.5, dampingFraction: 0.6), value: showContent)

            // Text with fade-in + slide
            Text("You're All Set!")
                .font(.title.bold())
                .opacity(showContent ? 1 : 0)
                .offset(y: showContent ? 0 : 10)
                .animation(.easeOut.delay(0.3), value: showContent)

            Text("Your profile is ready. Let's start building your path to success!")
                .multilineTextAlignment(.center)
                .foregroundColor(.gray)
                .padding(.horizontal)
                .opacity(showContent ? 1 : 0)
                .offset(y: showContent ? 0 : 10)
                .animation(.easeOut.delay(0.5), value: showContent)

            Spacer()

//            // Pagination Dots
//            HStack(spacing: 8) {
//                ForEach(0..<7) { index in
//                    Circle()
//                        .fill(index == 6 ? Color.yellow : Color.gray.opacity(0.3))
//                        .frame(width: 8, height: 8)
//                }
//            }
            .opacity(showContent ? 1 : 0)
            .animation(.easeOut.delay(0.7), value: showContent)

            // CTA Button
            Button(action: {
                navigateToDashboard = true
            }) {
                Text("Go to Dashboard")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(colors: [Color.yellow, Color.yellow], startPoint: .leading, endPoint: .trailing)
                    )
                    .foregroundColor(.white)
                    .cornerRadius(30)
            }
            .opacity(showContent ? 1 : 0)
            .animation(.easeOut.delay(0.9), value: showContent)

//            NavigationLink(destination: DashboardView(), isActive: $navigateToDashboard) {
//                EmptyView()
//            }
        }
        .padding()
        .onAppear {
            // Animate in when view appears
            showContent = true
        }
    }
}

