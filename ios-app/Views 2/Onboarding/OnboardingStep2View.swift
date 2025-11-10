import SwiftUI

struct OnboardingStep3View: View {
    @State private var email: String = ""
    @State private var allowSync: Bool = false
    @State private var showSafari = false
    @State private var selectedURL: URL? = nil
    @State private var goToImportResume = false



    var body: some View {
        
            VStack(spacing: 16) {
                Spacer().frame(height: 5)
                
//                Text("Sign In")
//                    .font(.largeTitle.bold())
//                    .frame(maxWidth: .infinity, alignment: .leading)
                
                Text("Choose how you'd like to sign in")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                VStack(spacing: 12) {
                    // Google Sign-In
                    Button(action: {
                        selectedURL = URL(string: "https://accounts.google.com/")
                        showSafari = true
                    })  {
                        HStack {
                            Image ("google")
                                .resizable()
                                .frame(width: 24, height: 24)
                            Text("Continue with Google")
                                .foregroundColor(.black)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.3)))
                    }
                    
                    // Outlook Sign-In
                    Button(action: {
                        selectedURL = URL(string: "https://login.live.com/")
                        showSafari = true
                    }) {
                        HStack {
                            
                            Image ("windows")
                                .resizable()
                                .frame(width: 24, height: 24)
                            Text("Continue with Outlook")
                                .foregroundColor(.black)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.3)))
                    }
                    
                    
                }
                
                HStack {
                    Divider()
                        .frame(height: 1)
                        .frame(maxWidth: 80) // Control the line length
                        .background(Color.gray.opacity(0.5))

                    Text("or")
                        .foregroundColor(.gray)
                        .padding(.horizontal, 8)

                    Divider()
                        .frame(height: 1)
                        .frame(maxWidth: 80)
                        .background(Color.gray.opacity(0.5))
                }

                
                TextField("Enter your email", text: $email)
                    .padding()
                    .background(Color.gray.opacity(0.05))
                    .cornerRadius(12)
                    .tint(AppColors.primary)
                
                HStack(alignment: .top, spacing: 24) {
                    Button(action: {
                        allowSync.toggle()
                    }) {
                        Image(systemName: allowSync ? "checkmark.square.fill" : "square")
                            .foregroundColor(.yellow)
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
//                            Image(systemName: "envelope.badge")
//                                .foregroundColor(.yellow)
                            Text("Allow email sync")
                                .font(.headline)
                                .foregroundColor(.primary)
                        }
                        
                        Text("Help us track your job applications automatically")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                }
                .padding()
                .background(Color.yellow.opacity(0.05))
                .cornerRadius(16)
                
                Spacer()
                
                // Pagination Dots
                HStack(spacing: 8) {
                    ForEach(0..<5) { index in
                        Circle()
                            .fill(index == 0 ? Color.yellow : Color.gray.opacity(0.3))
                            .frame(width: 8, height: 8)
                    }
                }
                
                Button(action: {
                    
                    // navigate to next screen
                    goToImportResume = true
                }) {
                    HStack {
                        Text("Continue")
                        
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background((email.isEmpty && !allowSync) ? Color.gray.opacity(0.3) : Color.yellow)
                    .foregroundColor(.white)
                    .cornerRadius(30)
                }
                .disabled(email.isEmpty && !allowSync)
                NavigationLink(destination: ImportResumeView(), isActive: $goToImportResume) {
                    EmptyView()
                }
                .hidden()
            }
            .padding()
            .navigationTitle("Sign In")
            .navigationBarTitleDisplayMode(.inline)

            .sheet(isPresented: $showSafari) {
                if let url = selectedURL {
                    SafariView(url: url)
                }
            }
            
        }
    }


