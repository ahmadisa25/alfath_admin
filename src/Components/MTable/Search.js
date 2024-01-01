import React from 'react'

const bootstrapColGenerator = (col_width) => {
    return col_width? `col-md-${col_width}`: "col-md-3"
}

const Search = ({ search, onSearchChange, onClear, searchBarWidth, placeholder }) => {
    /*let search_timer_id = -1;
    const onSearchKeyUp = (e) => {
        clearTimeout(search_timer_id);
        search_timer_id = setTimeout(() => {
            onSearchChange(e)
            setTimeout(() => {
                e.target.value="";
            }, 100)
        }, 500)
    }*/

    return (
        <div className={bootstrapColGenerator(searchBarWidth)}>
            <div className="form-group" style={{display:"flex", columnGap:"10px"}}>
           
                <div className="input-group">
                    <input
                        id="search"
                        name="search"
                        placeholder={placeholder || "Search here.."}
                        className="form-control searchField"
                        onChange={onSearchChange}
                        value={search}
                    />

                </div>
                <div className="input-group-append">
                        {search && <button
                            className={
                                search
                                    ? 'btn btn-outline-danger btn-search'
                                    : 'btn btn-outline-dark btn-search'
                            }
                            type="button"
                            style={{
                                borderWidth: 0.5,
                                borderColor: '#ccc'
                            }}
                            onClick={onClear} >
                            Clear
                        </button>}
                    </div>
            </div>
        </div>
    )
}

export default Search