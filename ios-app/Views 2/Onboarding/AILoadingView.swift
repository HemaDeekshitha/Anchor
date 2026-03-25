//
//  AILoadingView.swift
//  Anchor - iosApp
//
//  Displayed after the user completes all onboarding questions.
//  Shows an animated AI-analysis sequence before transitioning to
//  FinalOnboardingView ("You're All Set!").
//

import SwiftUI

struct AILoadingView: View {

    // MARK: – State
    @State private var currentStep = 0
    @State private var ringRotation: Double = 0
    @State private var pulseScale: CGFloat = 1.0
    @State private var dotOpacities: [Double] = [1, 0.4, 0.2]
    @State private var navigateToFinal = false
    @State private var allDone = false

    // MARK: – Steps
    private let steps: [(icon: String, text: String)] = [
        ("doc.text.magnifyingglass", "Reading your resume…"),
        ("brain",                    "Identifying your skills…"),
        ("chart.bar.xaxis",          "Analysing your goals…"),
        ("wand.and.stars",           "Building your personalised plan…"),
        ("sparkles",                 "Running AI analysis…"),
        ("checkmark.seal.fill",      "AI analysis complete!"),
    ]

    // How long to spend on each step (seconds)
    private let stepDuration: Double = 1.6

    var body: some View {
        ZStack {
            // ── Background gradient ──────────────────────────────────────────
            LinearGradient(
                colors: [
                    Color(red: 0.06, green: 0.06, blue: 0.12),
                    Color(red: 0.10, green: 0.08, blue: 0.20),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 48) {

                Spacer()

                // ── Spinning ring + pulsing orb ──────────────────────────────
                ZStack {
                    // Outer spinning ring
                    Circle()
                        .trim(from: 0.0, to: 0.75)
                        .stroke(
                            AngularGradient(
                                colors: [Color.yellow.opacity(0.0), Color.yellow],
                                center: .center
                            ),
                            style: StrokeStyle(lineWidth: 4, lineCap: .round)
                        )
                        .frame(width: 140, height: 140)
                        .rotationEffect(.degrees(ringRotation))

                    // Middle ring (counter-rotate)
                    Circle()
                        .trim(from: 0.0, to: 0.55)
                        .stroke(
                            AngularGradient(
                                colors: [Color.purple.opacity(0.0), Color.purple.opacity(0.7)],
                                center: .center
                            ),
                            style: StrokeStyle(lineWidth: 3, lineCap: .round)
                        )
                        .frame(width: 108, height: 108)
                        .rotationEffect(.degrees(-ringRotation * 0.7))

                    // Central pulsing orb
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color.yellow.opacity(0.9), Color.orange.opacity(0.4), Color.clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: 38
                            )
                        )
                        .frame(width: 76, height: 76)
                        .scaleEffect(pulseScale)

                    // Step icon inside the orb
                    Image(systemName: steps[currentStep].icon)
                        .font(.system(size: 26, weight: .semibold))
                        .foregroundColor(.white)
                        .transition(.blurReplace)
                        .id(currentStep) // force re-render on step change
                }

                // ── Step text ────────────────────────────────────────────────
                VStack(spacing: 16) {
                    Text(steps[currentStep].text)
                        .font(.title3.weight(.semibold))
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .transition(.blurReplace)
                        .id("text-\(currentStep)")

                    // Animated dot indicator
                    HStack(spacing: 8) {
                        ForEach(0..<3) { i in
                            Circle()
                                .fill(Color.yellow)
                                .frame(width: 8, height: 8)
                                .opacity(dotOpacities[i])
                        }
                    }
                }
                .padding(.horizontal, 32)

                // ── Progress bar ─────────────────────────────────────────────
                VStack(spacing: 8) {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.white.opacity(0.1))
                                .frame(height: 6)

                            RoundedRectangle(cornerRadius: 4)
                                .fill(
                                    LinearGradient(
                                        colors: [Color.yellow, Color.orange],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(
                                    width: geo.size.width * CGFloat(currentStep + 1) / CGFloat(steps.count),
                                    height: 6
                                )
                                .animation(.easeInOut(duration: 0.5), value: currentStep)
                        }
                    }
                    .frame(height: 6)
                    .padding(.horizontal, 40)

                    Text("\(Int(Double(currentStep + 1) / Double(steps.count) * 100))%")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.5))
                }

                Spacer()
            }
        }
        .navigationBarHidden(true)
        .onAppear(perform: startSequence)
        .background(
            NavigationLink(destination: FinalOnboardingView(), isActive: $navigateToFinal) {
                EmptyView()
            }
            .hidden()
        )
    }

    // MARK: – Animation helpers

    private func startSequence() {
        startRingAnimation()
        startPulseAnimation()
        startDotAnimation()
        advanceSteps()
    }

    private func startRingAnimation() {
        withAnimation(.linear(duration: 1.8).repeatForever(autoreverses: false)) {
            ringRotation = 360
        }
    }

    private func startPulseAnimation() {
        withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) {
            pulseScale = 1.18
        }
    }

    private func startDotAnimation() {
        let delay = 0.28
        func animateDot(_ index: Int) {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(index) * delay) {
                withAnimation(.easeInOut(duration: delay * 2).repeatForever(autoreverses: true)) {
                    dotOpacities[index] = index == 0 ? 0.2 : 1.0
                }
            }
        }
        animateDot(0); animateDot(1); animateDot(2)
    }

    private func advanceSteps() {
        for i in 0..<steps.count {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * stepDuration) {
                withAnimation(.easeInOut(duration: 0.4)) {
                    currentStep = i
                }
            }
        }
        // Navigate after all steps finish
        let total = Double(steps.count) * stepDuration + 0.6
        DispatchQueue.main.asyncAfter(deadline: .now() + total) {
            navigateToFinal = true
        }
    }
}

#Preview {
    NavigationStack {
        AILoadingView()
    }
}
