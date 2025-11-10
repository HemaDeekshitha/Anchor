//
//  LottieView.swift
//  Anchor - iosApp
//
//  Created by Pooja Raju on 11/8/25.
//

import SwiftUI
import Lottie

struct LottieView: UIViewRepresentable {
    let animationName: String

    func makeUIView(context: Context) -> UIView {
        let view = UIView()

        let animationView = LottieAnimationView(name: animationName)
        animationView.contentMode = .scaleAspectFill
        animationView.loopMode = .loop
        animationView.play()

        animationView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(animationView)

        NSLayoutConstraint.activate([
            animationView.widthAnchor.constraint(equalTo: view.widthAnchor),
            animationView.heightAnchor.constraint(equalTo: view.heightAnchor)
        ])

        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}
