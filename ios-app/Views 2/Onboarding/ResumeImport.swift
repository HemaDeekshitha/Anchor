//
//  ResumeImport.swift
//  Anchor - iosApp
//
//  Created by Pooja Raju on 11/8/25.
//

import SwiftUI
import UniformTypeIdentifiers

struct ImportResumeView: View {
    @State private var resumeText: String = ""
    @State private var showDocumentPicker = false
    @State private var selectedFileName: String?
    @State private var goToPrimaryFocusStep = false

    var body: some View {
        VStack(spacing: 16) {
            // Title
                       Text("Import Resume")
                           .font(.title.bold())
                           .frame(maxWidth: .infinity, alignment: .leading)
                       
                       Text("Upload or paste your resume to get tailored suggestions")
                           .font(.subheadline)
                           .foregroundColor(.gray)
                           .frame(maxWidth: .infinity, alignment: .leading)


            // Upload box
            Button(action: {
                showDocumentPicker.toggle()
            }) {
                VStack(spacing: 8) {
                    Image(systemName: "arrow.up.doc")
                        .font(.system(size: 30))
                        .foregroundColor(.yellow)
                    Text("Upload Resume")
                        .font(.headline)
                        .foregroundColor(.black)
                    Text("PDF, DOC, DOCX")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                .padding()
                .frame(maxWidth: .infinity, minHeight: 120)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.yellow.opacity(0.5), style: StrokeStyle(lineWidth: 1, dash: [5])))

            }
            .padding(.top, 10)


            if let fileName = selectedFileName {
                Text("Selected: \(fileName)")
                    .font(.footnote)
                    .foregroundColor(.gray)
            }

            // Divider with "or"
            HStack {
                Rectangle().frame(height: 1).foregroundColor(.gray.opacity(0.3))
                Text("or").foregroundColor(.gray).padding(.horizontal, 8)
                Rectangle().frame(height: 1).foregroundColor(.gray.opacity(0.3))

            }

            // Paste resume text
            VStack(alignment: .leading) {
                Text("Paste Resume Text")
                    .font(.subheadline)

                TextEditor(text: $resumeText)
                    .frame(height: 120)
                    .padding(8)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.2)))
                                    .tint(AppColors.primary)

            }

            Spacer()

            // Pagination dots
            HStack(spacing: 8) {
                ForEach(0..<5) { index in
                    Circle()
                        .fill(index == 1 ? Color.yellow : Color.gray.opacity(0.3))
                        .frame(width: 8, height: 8)
                }
            }

            // Continue button
            Button("Continue") {
                // navigate or process upload
                goToPrimaryFocusStep = true
            }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.yellow)
                .foregroundColor(.white)
                .cornerRadius(30)
            }
        .padding(20)
        NavigationLink(destination: PrimaryFocusView(), isActive: $goToPrimaryFocusStep) {
            EmptyView()
        }
        .hidden()
        
        .sheet(isPresented: $showDocumentPicker) {
            DocumentPicker(fileName: $selectedFileName)
        }
        
    }
}
