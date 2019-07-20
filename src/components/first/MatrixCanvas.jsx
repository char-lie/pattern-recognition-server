/**
 * MIT License
 *
 * Copyright (c) 2019 char-lie
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React from 'react';
import PropTypes from 'prop-types';

class MatrixCanvas extends React.Component {
  static get propTypes() {
    return {
      height: PropTypes.number.isRequired,
      matrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]))).isRequired,
      width: PropTypes.number.isRequired,
      palette: PropTypes.objectOf(PropTypes.string),
    };
  }

  static get defaultProps() {
    return {
      palette: null,
    };
  }

  componentDidMount() {
    const { matrix } = this.props;
    this.draw(matrix);
  }

  componentDidUpdate() {
    const { matrix } = this.props;
    this.draw(matrix);
  }

  draw(matrix) {
    const { height, width, palette } = this.props;
    const blockHeight = height / matrix.length;
    const blockWidth = width / matrix[0].length;
    const ctx = this.canvas.getContext('2d');
    const originalFillStyle = ctx.fillStyle;
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (palette) {
          ctx.fillStyle = palette[matrix[y][x]];
        } else {
          ctx.fillStyle = matrix[y][x];
        }
        ctx.fillRect(
          Math.floor(x * blockWidth),
          Math.floor(y * blockHeight),
          Math.ceil(blockWidth),
          Math.ceil(blockHeight),
        );
      }
    }
    ctx.fillStyle = originalFillStyle;
  }

  render() {
    const { height, width } = this.props;
    return (
      <div>
        <canvas
          ref={(component) => { this.canvas = component; }}
          width={width}
          height={height}
        />
      </div>
    );
  }
}

export default MatrixCanvas;
