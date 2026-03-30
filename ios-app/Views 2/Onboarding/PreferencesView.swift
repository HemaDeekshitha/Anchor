//
//  PreferencesView.swift
//  Anchor - iosApp
//
//  Created by Pooja Raju on 11/8/25.
//

import SwiftUI


struct PreferencesView: View {
@State private var selectedIndustries: Set<String> = []
@State private var selectedEmployment: Set<String> = []
@State private var targetRole: String = ""
@State private var navigate = false
@State private var skipToFinal = false


let industries = ["Technology", "Healthcare", "Finance", "Education", "Marketing", "Sales", "Design", "Engineering"]
let employmentTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"]


var body: some View {
ScrollView {
VStack(alignment: .leading, spacing: 16) {
    Spacer().frame(height: 5)
    // Top right Skip
                HStack {
                    Spacer()
                    Button("Skip") {
                        skipToFinal = true
                    }
                    .foregroundColor(.purple)
                }
    Text("Preferences")
        .font(.largeTitle.bold())
        .frame(maxWidth: .infinity, alignment: .leading)

    Text("Let's personalize your experience")
        .font(.subheadline)
        .foregroundColor(.gray)
        .frame(maxWidth: .infinity, alignment: .leading)

Text("Industries of Interest")
.font(.headline)


ForEach(industries, id: \.self) { industry in
Button(action: {
if selectedIndustries.contains(industry) {
selectedIndustries.remove(industry)
} else {
selectedIndustries.insert(industry)
}
}) {
Text(industry)
.frame(maxWidth: .infinity)
.foregroundColor(.yellow.opacity(0.8))
.bold()
.padding()
.background(selectedIndustries.contains(industry) ? Color.yellow.opacity(0.1) : Color.white)
.overlay(RoundedRectangle(cornerRadius: 25).stroke(selectedIndustries.contains(industry) ? Color.yellow : Color.gray.opacity(0.35), lineWidth: selectedIndustries.contains(industry) ? 3.5 : 3))
.cornerRadius(25)
}
}


Text("Target Role")
.font(.headline)

TextField("e.g., Product Manager, Software Engineer", text: $targetRole)
.padding()
.background(Color.gray.opacity(0.05))

.tint(AppColors.primary)

.bold()
.cornerRadius(12)


Text("Employment Type")
.font(.headline)



ForEach(employmentTypes, id: \.self) { type in
Button(action: {
if selectedEmployment.contains(type) {
selectedEmployment.remove(type)
} else {
selectedEmployment.insert(type)
}
}) {
Text(type)
.frame(maxWidth: .infinity)
.foregroundColor(.yellow.opacity(0.8))
.bold()
.padding()
.background(selectedEmployment.contains(type) ? Color.yellow.opacity(0.1) : Color.white)
.overlay(RoundedRectangle(cornerRadius: 25).stroke(selectedEmployment.contains(type) ? Color.yellow : Color.gray.opacity(0.35), lineWidth: selectedEmployment.contains(type) ? 3.5 : 3))
.cornerRadius(25)
}
}


Spacer()
    // Pagination Dots
    HStack(spacing: 8) {
        ForEach(0..<5) { index in
            Circle()
                .fill(index == 4 ? Color.yellow : Color.gray.opacity(0.3))
                .frame(width: 8, height: 8)
        }
    }
    .frame(maxWidth: .infinity, alignment: .center) // centers horizontally


Button("Continue") {
navigate = true
}
.disabled(targetRole.isEmpty || selectedIndustries.isEmpty || selectedEmployment.isEmpty)
.frame(maxWidth: .infinity)
.padding()
.background((targetRole.isEmpty || selectedIndustries.isEmpty || selectedEmployment.isEmpty) ? Color.gray.opacity(0.4) : Color.yellow)
.foregroundColor(.white)
.cornerRadius(30)


NavigationLink(destination: AILoadingView(), isActive: $navigate) {
EmptyView()
}
    NavigationLink(destination: AILoadingView(), isActive: $skipToFinal) {
                    EmptyView()
                }.hidden()
}
.padding()
}
}
}
