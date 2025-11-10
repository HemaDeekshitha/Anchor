import SwiftUI
extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        _ = scanner.scanString("#") // skip the #

        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)

        let r = Double((rgb >> 16) & 0xFF) / 255.0
        let g = Double((rgb >> 8) & 0xFF) / 255.0
        let b = Double(rgb & 0xFF) / 255.0

        self.init(red: r, green: g, blue: b)
    }
}




struct OnboardingWelcomeView: View {
    @ObservedObject var viewModel: OnboardingViewModel
    @State private var navigateToNext = false //navigation triggering
    @State private var showLogo = true
    @State private var animateText = false
    

    
    
    
    var body: some View {
        ZStack {
            LottieView(animationName: "waves") // your .json file name (without .json)
                    
                    
                    .frame(width: 400, height: 900)
                    .opacity(8.0) // Optional: to darken background
                    .ignoresSafeArea()
                    



                    // Smooth Yellow Gradient Background
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(red: 1.0, green: 0.976, blue: 0.77),  // #FFF9C4 (light yellow)
                            Color(red: 1.0, green: 0.909, blue: 0.51),  // #FFE082 (medium)
                            Color(red: 1.0, green: 0.835, blue: 0.31)   // #FFD54F (warm golden)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                        
                    )
                    .opacity(0.5)
                    .ignoresSafeArea()  // makes it fill the entire screen
        .frame(maxWidth: .infinity, maxHeight: .infinity) // take full screen space
            VStack(spacing: 24) {
                
                // Logo Section
                             HStack {
                                 if showLogo {
                                     Image("anchor") // 🔹 replace with your actual asset name
                                         .resizable()
                                         
                                         .frame(maxWidth: .infinity, alignment: .leading)
                                         .cornerRadius(20)
                                         .scaledToFit()
                                         .frame(width: 40, height:50)
                                         .transition(.move(edge: .leading).combined(with: .opacity))
                                         .animation(.easeOut(duration: 1.0), value: showLogo)
                                 }
                                 Spacer()
                             }
                             .padding(.horizontal, 5)
                             .padding(.top, 60)

                             Spacer()
                
                    Text("ANCHOR")
                        .font(.system(size: 64, weight: .bold, design: .monospaced))
                        
                        .foregroundColor(Color(hex: "#FCD343")) // Golden Yellow
                        .shadow(color: Color(hex: "#FCEFAA").opacity(0.8), radius: 4, x: 2, y: 2)
                        .padding(.bottom, 12)
                        .padding(.horizontal, 20)
//                        .frame(maxWidth: .infinity, alignment: .leading)
                        .opacity(animateText ? 1 : 0)
                            .offset(y: animateText ? 0 : 20) // slight slide-in effect
                            .animation(.easeOut(duration: 1), value: animateText)

//                    Text("Not Just a Job Hunt — A Rewarding Journey")
//                        .font(.subheadline)
//                        .padding(.horizontal, 20)
//                        .padding(.vertical, 8)
//                        .background(.yellow.opacity(0.26))
//                        .cornerRadius(16)
                    //Text
                // Subtitle
//                                Text("Not Just a Job Hunt \nA Rewarding Journey")
//                                    .multilineTextAlignment(.center)
//                                    .font(.system(size: 18, weight: .medium, design: .rounded))
//                                    .foregroundColor(.black.opacity(0.7))
//                                    .padding(.horizontal, 24)
                
                Spacer()
                
                
//                FeatureCarouselView(features: [
//                    "Personalized Job Tracking",
//                    "AI Resume Optimization",
//                    "Interview Readiness Toolkit",
//                    "Networking and Referrals"
//                ])
//                .padding(.top, 20)

                
                Spacer()
                Button(action: {
                    navigateToNext = true
                }) {
                    Text("Let's Get Started")
                        .foregroundColor(.white)
                        .padding()
                        .frame(width: 220, height: 55) // ⬅️ Reduced width and fixed height
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [.yellow, .yellow]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(30)
                }

                // NavigationLink
                NavigationLink(
                    destination: OnboardingStep3View(),
                    isActive: $navigateToNext
                ) {
                    EmptyView()
                }

                // Positioning
                .padding(.top, 0) // pushes button lower
                .frame(maxWidth: .infinity)
                .padding(.bottom, 0) // adjust this to stick it closer to bottom

                
                Spacer()
            }
            .padding()
        }
        .onAppear {
            animateText = true
        }
//        .onAppear {
//                    withAnimation(.easeOut(duration: 1.0)) {
//                        showLogo = true
//                    }
//                }
    }
}
//struct FeatureCarouselView: View {
//    let features: [String]
//    @State private var currentIndex = 0
//    let timer = Timer.publish(every: 2.5, on: .main, in: .common).autoconnect()
//
//    var body: some View {
//        TabView(selection: $currentIndex) {
//            ForEach(features.indices, id: \.self) { index in
//                Text(features[index])
//                    .font(.headline)
//                    .foregroundColor(.black)
//                    .padding()
//                    .frame(width: 300, height: 120)
//                    .background(Color.white.opacity(0.9))
//                    .cornerRadius(20)
//                    .shadow(radius: 5)
//                    .tag(index)
//            }
//        }
//        .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
//        .frame(height: 150)
//        .onReceive(timer) { _ in
//            withAnimation {
//                currentIndex = (currentIndex + 1) % features.count
//            }
//        }
//    }
//}
