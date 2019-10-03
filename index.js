import React from 'react';
import './DataTable.css';
import ReactDOM from 'react-dom';

export default class DataTable extends React.Component
{
    _preSearchData = null
    constructor(props)
    {
        console.log('3.Entering into index constructor')
        super(props);
        this.state = {
            headers : props.headers,
            data    : props.data,
            sortby  : null,
            descending : null,
            search : false
        }
        this.keyField = props.keyField || "id" ; 
        this.noData   = props.noData || "No records found ! ";
        this.width    = props.width || "100";
    } //end of constructor

        onDragOver = (e) =>
        {
            e.preventDefault(); 
        }
        onDragStart=(e,source)=>
        {
            e.dataTransfer.setData('text/plain',source);
        }
        onDrop = (e,target) =>
        {
            e.preventDefault();
            let source= e.dataTransfer.getData('text/plain');
            let headers = [...this.state.headers];
            let srcHeader = headers[source];
            let targetHeader = headers[target];

            let temp= srcHeader.index;
            srcHeader.index = targetHeader.index;
            targetHeader.index = temp;

            this.setState (
                {
                    headers
                }
            )
        }
        renderTableHeader = () =>
        {
          let {headers} = this.state;
          headers.sort ((a,b)=>
          {
              if (a.index > b.index) return 1;
              return -1; 
          })
          let headerView= headers.map((header,index) =>
          {
             let title=header.title;
             let cleanTitle = header.accessor;
             let width=header.width; 
             if (this.state.sortby=== index)
             {
                 title += this.state.descending?  '\u2193' : '\u2191' ;
             } 
             return(
                 <th key={cleanTitle}
                 ref={(th)=>this[cleanTitle]=th}
                 style={{width:width}}
                 data-col = {cleanTitle}
                 onDragStart = {(e)=> this.onDragStart(e,index)}
                 onDragOver = {this.onDragOver}
                 onDrop = {(e)=>{this.onDrop(e,index)}} > 
                         <span draggable data-col = {cleanTitle}  className="header-cell">
                         {title}
                     </span>
                 </th>
             )
          });
          return headerView;
        }

        renderNoData = () =>{
                    return (<tr>
                <td colSpan={this.props.headers.length}>
                        {this.noData} 
                </td>   
            </tr>);

        }
        renderContent = () =>
        {
            let {headers,data}=this.state;
            let contentView=data.map((row,rowIdx)=> {
                let id=row[this.keyField];
                let tds=headers.map((header,index) =>
                {
                    let content = row[header.accessor];
                    let cell= header.cell;
                    if(cell)
                    {
                        if (typeof(cell)==='object')
                        {
                            if (cell.type==="image" && Image)
                            {
                                content = <img alt="123" style={cell.style} src={content} />
                            }
                            
                        }
                        else if(typeof(cell)==='function')
                            {
                                content = cell(content);
                            }
                    }
                    return(
                        <td key={index} data-id={id} data-row={rowIdx}>
                            {content}
                        </td>
                    )
                });
                return(
                    <tr key="rowIdx">
                         {tds}
                    </tr>
                );
            });
            return contentView;
            
        }
        onSort = (e) =>
        {
            let data = this.state.data.slice();
            let colIndex = ReactDOM.findDOMNode(e.target).parentNode.cellIndex;
            let colTitle = e.target.dataset.col;
            let descending = ! this.state.descending; 
      data.sort((a,b)=>
      {
          let sortVal = 0;
          if(a[colTitle]<b[colTitle])
          {
              sortVal=-1;
          }
          else if(a[colTitle]> b[colTitle])
          {
              sortVal=1;
          }
          if (descending)
          {
              sortVal= sortVal * -1 ;
          }
          return sortVal;
      }
      )
            this.setState({
                data,
                sortby : colIndex,
                descending
            })
             
        }
        onSearch = (e) =>
        {
            let {headers}=this.state;
            //get index of target column
            let idx=e.target.dataset.idx;

            //get the column
            let targetCol = this.state.headers[idx].accessor;
            let data=this._preSearchData;
            //filter the data
            let searchData= this._preSearchData.filter((row)=>{
                let show=true;
                for (let field in row)
                {
                    let fieldValue= row[field];
                    let inputId='inp'+field;
                    let input = this[inputId];
                    if(!fieldValue==='')
                    {
                        show=true;
                    }
                    else
                    {
                        show= fieldValue.toString().toLowerCase().indexOf(input.value.toLowerCase())>-1;
                        if(!show) break;
                    }
                }
                return show;
                //return row[targetCol].toString().toLowerCase().indexOf(needle)>-1;
            });

            //update the state
            this.setState(
                {
                    data : searchData 
                }
            )
            
        }
        renderSearch =  () =>
        {
            let{search,headers}= this.state;
            if(!search)
            {
                return null;
            }  
            let searchInputs = headers.map((header,idx)=>{   
                //Get the header ref.
                let hdr = this[header.accessor];
                let inputId = 'inp' +  header.accessor; 
            return(
                    <td key={idx}>
                        <input type="text" 
                        ref={(input)=>this[inputId]=input}
                         style={{
                             width: hdr.clientWidth -17 + "px"
                         }}
                         data-idx = {idx}  
                         />
                    </td>
                );
            });
            return(
                <tr onChange={this.onSearch}>
                {searchInputs}
                </tr>
            );
        }
   renderTable = () =>
   {
     let title= this.props.title || "DataTable";
     let headerView = this.renderTableHeader();
     let contentView = this.state.data.length > 0 ?
        this.renderContent() : this.renderNoData();
     return (
      <table className="data-inner-table">
          <caption className="data-table-caption">
              {title}
          </caption>
          <thead onClick={this.onSort}>
          <tr>
             {headerView} 
          </tr>
          </thead>
          <tbody>
          {this.renderSearch()}
          {contentView}
          </tbody>
      </table>
     );
   }
   onToggleSearch = (e)=>
   {
        if (this.state.search)
        {
            this.setState({
                data : this._preSearchData,
                search : false
            });
             this._preSearchData = null;
        }
        else{
            this._preSearchData = this.state.data;
            this.setState({
                search : true
            })
        }
   }
   renderToolbar = () =>
   {
       return(
            <div className = "toolbar">
                <button onClick={this.onToggleSearch}>
                    Search
                </button>
           </div>
       );
   }
    render() 
     {
        return( 
        <div className={this.props.className}>
        {this.renderToolbar()}
         {this.renderTable()}
         </div>
     
        );
    }
}