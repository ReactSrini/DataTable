import React,{Component} from 'react';
import axios from 'axios';
import './App.css';
import DataTable from './Components/DataTable'

class App extends Component {
   
  
  constructor(props)
    {
     
      console.log('1.Entering into constructor')
      super(props);
      this.state= {
        headers :  [
          {title : "Id",accessor:"id",index : 0},
          {title : "Profile",accessor:"profile",width:"80px",index :1,  cell:{
            type : "image",
            style : {
              "width" : "50px",
            }
          }
          },
          {title:"Name",accessor:"name",width:"300px",index:2},
          {title:"Age",accessor:"age",index:3},
          {title:"Role",accessor:"role",index:4},
          {title:"Rating",accessor:"rating",index:5,width:"200px",cell : row=>(
            <div className="rating">
             <div style={{
                backgroundColor : "lightskyblue",
                textAlign : "center",
                height : "1.09 em",
                width : (row/5) * 201 + "px",
                margin : "3px 0 4px 0"
             }}> {row}</div>
              
            </div>
          )},
        ],
        
        data : [],
        dataFlag : 0         
      }
    
     this.fetchData();
             
    }
  
     // *** Accessing Data From API From Here ***
   fetchData=()=>{
     let currentComponent = this ;
    axios.get('http://localhost:3000/users')
    .then(function (response) {
      console.log('2.Entering into fetch from constructor')
    
     currentComponent.setState ({data : Object.values(response.data.data)})
     //currentComponent.setState ({data : response.data.data})
     console.log(currentComponent.state.data);
        console.log('length is : ' + currentComponent.state.data.length)
        currentComponent.setState({dataFlag : 1}) 
      
      
    }) 
    
    }
    //       *** End of API Block ***


  render()
  {
    console.log('entering into render')
    if (this.state.dataFlag===1)
    { 
      console.log('render true block')
      console.log(this.state.data)
      return (
        <div>
          <DataTable className="data-table"
          title="Player Stats"
          keyField="id" 
          pagination= {{
             enabled :true ,
             pagelength : 5,
             type : "long" //long or short
            }}
             width="100%"
             headers={this.state.headers}
             data={this.state.data}
             noData="No records found"
         />
        </div>
      );
  
    }
    else
    {
      console.log('render false block');
      return <div>loading...</div> ;
    }

  }
    

    
  
}

export default App;
