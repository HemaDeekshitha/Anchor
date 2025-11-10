import SwiftUI

struct SignInButtonView: View {
    var icon: String
    var title: String

    var body: some View {
        HStack {
            Image(icon)
                .resizable()
                .frame(width: 20, height: 20)
                .clipShape(RoundedRectangle(cornerRadius: 4))
            Text(title)
                .foregroundColor(.black)
                .font(.body)
            Spacer()
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.gray.opacity(0.3))
        )
    }
}

