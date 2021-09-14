import {useRef,useEffect,useState} from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const [shape, setShape] = useState('line')
  const [countPoint, setCountPoint] = useState(0)
  const [arrayPointX, setArrayPointX] = useState([])
  const [arrayPointY, setArrayPointY] = useState([])
  const [lineWidth, setLineWidth] = useState(1)
  const [lineColor, setLineColor] = useState('#00000')

  useEffect(()=>{
    const canvas = canvasRef.current
    canvas.width = (window.innerWidth*0.7) * 2
    canvas.height = (window.innerHeight) * 2
    canvas.style.width = `${window.innerWidth*0.7}px`
    canvas.style.height = `${window.innerHeight}px`
    
    const context = canvas.getContext("2d")
    context.scale(2,2)
    contextRef.current = context
  }, [])

  const setPoint = (max, nativeEvent) => {
    const { offsetX, offsetY } = nativeEvent
    if(countPoint < max){ 
      setArrayPointX([...arrayPointX, offsetX])
      setArrayPointY([...arrayPointY, offsetY])
      setCountPoint(countPoint+1)
      return
    }
    setCountPoint(0)
    setArrayPointX([])
    setArrayPointY([])
  }
  const lineDDA = (x1,y1,x2,y2) => {
    /** Diferencial de dx = x2 - x1 */
    let dx = x2 - x1
    /** Diferencial de dy = y2 - y1 */
    let dy = y2 - y1

    /** Dependiendo del valor absoluto de dx y dy
     * se va a escoger el número de paso que se pondrá el pixel como
     * steps = abs(dx) > abs(dy) ? abs(dx) : abs(dy) */
    const step = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy)

    /* Calculando el incremento de x para cada Paso */
    dx = dx / step
    /* Calculando el incremento de y para cada Paso */
    dy = dy / step

    /** Distancia en X del pixel a pintar */
    let pixelX = x1
    /** Distancia en Y del pixel a pintar */
    let pixelY = y1

    // Color de la linea
    contextRef.current.fillStyle = lineColor

    for (let i = 0; i < step; i++) {
      // Dibujar un pixel
      contextRef.current.fillRect(pixelX,pixelY,lineWidth,lineWidth)
      // Sumar 
      pixelX += dx
      pixelY += dy
    }
  }
  const rectangleDDA = (x1,y1,x2,y2) => {
    lineDDA(x1,y1,x2,y1)
    lineDDA(x2,y1,x2,y2)
    lineDDA(x2,y2,x1,y2)
    lineDDA(x1,y2,x1,y1)
  }
  const squareDDA = (x1,y1,x2,y2) => {
    const dx = x2-x1
    const dy = y2-y1
    const r = dx > dy ? dx : dy
    lineDDA(x1,y1,x1+r,y1)
    lineDDA(x1+r,y1,x1+r,y1+r)
    lineDDA(x1+r,y1+r,x1,y1+r)
    lineDDA(x1,y1+r,x1,y1)
  }
  const triangleDDA = (x1,y1,x2,y2,x3,y3) => {
    lineDDA(x1,y1,x2,y2)
    lineDDA(x2,y2,x3,y3)
    lineDDA(x3,y3,x1,y1)
  }
  const circumference = (cx,cy,rx,ry) => {
    const dx = cx - rx
    const dy = cy - ry
    const r = Math.sqrt(dx*dx+dy*dy)
    let p = 1 - r
    let addx = 0
    let addy = r
    contextRef.current.fillStyle = lineColor
    drawEightPoint(cx,cy,addx,addy)
    while(addx<addy){
      addx++
      if(p<0) {
        p+=2*addx+1
      } else {
        addy--
        p+=2*(addx-addy)+1
      }
      drawEightPoint(cx,cy,addx,addy)
    }
  }
  const drawEightPoint = (cx,cy,addx,addy) => {
    contextRef.current.fillRect(cx+addx, cy+addy, lineWidth, lineWidth)
    contextRef.current.fillRect(cx-addx, cy+addy, lineWidth, lineWidth)
    contextRef.current.fillRect(cx+addx, cy-addy, lineWidth, lineWidth)
    contextRef.current.fillRect(cx-addx, cy-addy, lineWidth, lineWidth)
    contextRef.current.fillRect(cx+addy, cy+addx, lineWidth, lineWidth)
    contextRef.current.fillRect(cx-addy, cy+addx, lineWidth, lineWidth)
    contextRef.current.fillRect(cx+addy, cy-addx, lineWidth, lineWidth)
    contextRef.current.fillRect(cx-addy, cy-addx, lineWidth, lineWidth)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas.getContext) return
    const context = canvas.getContext("2d")
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const draw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    setPoint(1,nativeEvent)
    if(shape === 'line') return lineDDA(arrayPointX[0],arrayPointY[0],offsetX,offsetY)
    if(shape === 'rec') return rectangleDDA(arrayPointX[0],arrayPointY[0],offsetX,offsetY)
    if(shape === 'square') return squareDDA(arrayPointX[0],arrayPointY[0],offsetX,offsetY)
    if(shape === 'circle') return circumference(arrayPointX[0],arrayPointY[0],offsetX,offsetY)
    setPoint(2,nativeEvent)
    if(shape === 'triangle') return triangleDDA(arrayPointX[0],arrayPointY[0],arrayPointX[1],arrayPointY[1],offsetX,offsetY)
  }

  return (
    <div className="container">
      <canvas
        ref={canvasRef}
        onClick={draw}
      />
      <section className="info">
      <h1>Taller 1</h1>
      <div className="form">
        <h4>Formas:</h4>
        <input 
          type="radio" 
          name="draw" 
          value="dda" 
          onClick={() => setShape('line')}
          defaultChecked={true}
        />
        <label> Linea: DDA</label>
        <br />
        <input
          type="radio"
          name="draw"
          onClick={() => setShape('rec')}
        />
        <label> Rectangulo</label>
        <br />
        <input
          type="radio"
          name="draw"
          onClick={() => setShape('square')}
        />
        <label> Cuadrado</label>
        <br />
        <input
          type="radio"
          name="draw"
          onClick={() => setShape('triangle')}
        />
        <label> Triangulo</label>
        <br />
        <input
          type="radio"
          name="draw"
          onClick={() => setShape('circle')}
        />
        <label> Círculo</label>
        <br />
        <br />
        <h4>Personalización:</h4>
        <label>Grosor </label>
        <input
          type="number"
          name="draw"
          min="1"
          max="10"
          step="1"
          defaultValue={lineWidth}
          onChange={e => setLineWidth(e.target.value)}
        />
        <br />
        <label>Color </label>
        <input
          type="color"
          name="draw"
          defaultValue={lineColor}
          onChange={e => setLineColor(e.target.value)}
        />
        <br />
        <br />
        <button onClick={clearCanvas}>Borrar todo</button>
      </div>
      </section>
    </div>
  )
}

export default App
