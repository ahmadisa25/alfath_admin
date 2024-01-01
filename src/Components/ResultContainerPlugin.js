import React from 'react';

function filterResults(results) {
    let filteredResults = [];
    for (var i = 0; i < results.length; ++i) {
        if (i === 0) {
            filteredResults.push(results[i]);
            continue;
        }

        if (results[i].decodedText !== results[i-1].decodedText) {
            filteredResults.push(results[i]);
        }
    }
    return filteredResults;
}

class ResultContainerTable extends React.Component {
    render() {
        var results = filterResults(this.props.data);
        return (
            <table className={'table table-bordered'}>
                <thead>
                    <tr>
                        <td style={{ fontWeight: 600, textAlign: 'left'}} width={50}>No</td>
                        <td style={{ fontWeight: 600, textAlign: 'left'}}>Serial Number / QR</td>
                        <td style={{ fontWeight: 600}}>Action</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        results.map((result, i) => {
                            console.log(result);
                            return (<tr key={i}>
                                <td>{i+1}</td>
                                <td style={{ textAlign: 'left'}}>{result.decodedText}</td>
                                <td style={{color: 'red'}}><span className='fas fa-trash'></span></td>
                            </tr>);
                        })
                    }
                </tbody>
            </table>
        );
    }
}

class ResultContainerPlugin extends React.Component {
    render() { 
        let results = filterResults(this.props.results);
        return (<div className='Result-container'>
                <div className='Result-header'>Scanned results ({results.length})</div>
                <div className='Result-section'>
                    <ResultContainerTable data={this.props.results} />
                </div>
            </div>);
    }
}

export default ResultContainerPlugin;