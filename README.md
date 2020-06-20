# Neural Network Playground
This is a tool to experiment basic neural network architectures and build intuitions on machine learning.

The main idea is provide an environnement to experiment how data and learning parameters affects the network training.

# Play

The online demo is available here :

https://akarzazi.github.io/neural-network-playground

# How does it work

To get a first sight, click on the play button and watch the prediction evolving towards the labeled data.

The lab has two main sections :
 
* Generate labeled data.

* Train the network and watch the metrics.

## Labeled Data 

Training data has the following shape : `{a, b} => label`, for a pair of numbers `a` and `b`, we will associate an expected number `label`.

`a` and `b` are represented on a 2d plane on the x and y axes respectively and the `label` is viewed by a color scale.

## Training the network 

The goal of the network is to understand the relationship between `{a, b}` and the expected `label`.

The achieve this task you may need to tweak several things, the most important are :

* The neural network shape and activation functions.
* The batch size.
* The optimizer settings.

# References

This project was inspired by great resources on the internet : 

https://playground.tensorflow.org/

https://ruder.io/optimizing-gradient-descent/

https://www.youtube.com/user/shiffman/videos (the coding train)


# Contributing

We're glad to know you're interested in the project.

Your contributions are welcome !

## How can I contribute ?

You can contribute in the following ways : 

* Report an issue / Suggest a feature.
* Create a pull request.

