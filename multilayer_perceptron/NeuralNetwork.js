class NeuralNetwork {
  constructor(inp, hid, out, lr, trainFunc) {
    this.inputs = inp;
    this.hidden = hid;
    this.outputs = out;

    this.weights_ih = new Matrix(this.hidden, this.inputs);
    this.weights_ho = new Matrix(this.outputs, this.hidden);
    this.bias_h = new Matrix(this.hidden, 1);
    this.bias_o = new Matrix(this.outputs, 1);

    this.weights_ih.randomize(-1, 1);
    this.weights_ho.randomize(-1, 1);
    this.bias_h.randomize(-1, 1);
    this.bias_o.randomize(-1, 1);

    this.lr = lr || 0.01;

    switch( trainFunc ) {
      case 'sigmoid':
      case 'tanh':
      case 'softplus':
      case 'relu':
      case 'linear': {
        this.trainFunc = trainFunc;
        break;
      }
      default: {
        this.trainFunc = 'sigmoid';
        break;
      }
    }
  }

  static sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  static dsigmoid(x) {
    let sig = NeuralNetwork.sigmoid(x);
    return sig * (1 - sig);
  }

  static relu(x) {
    return ( x >= 0 ) ? x : 0;
  }

  static drelu(x) {
    return ( x >= 0 ) ? 1 : 0;
  }

  static softplus(x) {
    return Math.log1p( Math.exp(x) );
  }

  static dsoftplus(x) {
    return 1 / (1 + Math.exp(-x));
  }

  static tanh(x) {
    return Math.tanh(x);
  }

  static dtanh(x) {
    return 1 / ( Math.cosh(x) ** 2 );
  }

  static linear(x) {
    return x;
  }

  static dlinear() {
    return 1;
  }

  predict(inp_arr, arr) {
    let inputs = Matrix.fromArray(inp_arr, [ inp_arr.length, 1 ]);

    let hidden = this.weights_ih.mul( inputs ).add( this.bias_h );
    hidden.forEach(NeuralNetwork.sigmoid, true);

    let output = this.weights_ho.mul( hidden ).add( this.bias_o );
    output.forEach(NeuralNetwork.sigmoid, true);

    return ( arr ) ? output.toArray() : output;
  }

  train(inp_arr, tg) {
    let inputs = Matrix.fromArray(inp_arr, [ inp_arr.length, 1 ]);
    let tf = this.trainFunc;

    /// Hidden Layer response
    let hidden = this.weights_ih.mul( inputs ).add( this.bias_h );
    let hidden_act = hidden.forEach(NeuralNetwork[tf]);

    // hidden_act.print('Hidden Layer activated');

    /// Output layer response
    let outputs = this.weights_ho.mul( hidden_act ).add( this.bias_o );
    let outputs_act = outputs.forEach(NeuralNetwork[tf]);

    // outputs_act.print('Ouputs activated');

    let targets = Matrix.fromArray(tg, outputs.dims());
    let output_errors = targets.sub(outputs_act);

    // output_errors.print('Output Errors');

    /// Backpropagation
    let weights_ho_T = this.weights_ho.transpose();
    let rowSum_ho_T = this.weights_ho.npdot( new Matrix( this.weights_ho.dims()[1], 1, 1 ) );

    weights_ho_T.forEach((val, i, j) => {
      return val / rowSum_ho_T.get(j, 0);
    }, true);

    /// Hidden layer error
    let hidden_error = weights_ho_T.mul(output_errors);

    // hidden_error.print('Hidden Layer errors');

    /// Gradient Descent
    /// Output
    let gradient_o = output_errors.
      dot( outputs.forEach(NeuralNetwork['d' + tf]) ).
      mul( this.lr );

    let hidden_T = hidden.transpose();
    let weights_ho_deltas = gradient_o.mul(hidden_T);

    // weights_ho_deltas.print('weights_ho_deltas');

    this.weights_ho.add(weights_ho_deltas, true);
    this.bias_o.add(gradient_o, true);

    /// Hidden
    let gradient_h = hidden_error.
      dot( hidden.forEach(NeuralNetwork['d' + tf]) ).
      mul( this.lr );

    let input_T = inputs.transpose();
    let weights_ih_deltas = gradient_h.mul(input_T);

    // weights_ih_deltas.print('weights_ih_deltas');

    this.weights_ih.add(weights_ih_deltas, true);
    this.bias_h.add(gradient_h, true);

    return output_errors;

  }
}