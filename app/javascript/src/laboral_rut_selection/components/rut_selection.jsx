import _ from 'lodash';
import React from 'react';

export default class RutSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cases_number: 10,
      filterSearchField: '',
      typeOfCause: '',
      search_type: 'rut',
      selectAll: true
    }
  }

  search = (type) => (e) => {
    e.preventDefault();
    this.setState({ search_type: type });
    this.props.clearCases();
    this.props.updateSearchType(type);
    this.props.search(this.props.term, type, this.state.cases_number, 0, this.state.typeOfCause);
  }

  toggleSelect = (id) => (e) => {
    this.props.toggleSelect(id);
  }

  updatePage = (e) => {
    e.preventDefault();
    let newPage = this.props.current_page + 1;
    this.props.updateCurrentPage(newPage);
    this.loadMore(newPage);
  }

  loadMore = (newPage) => {
    let offset = this.props.cases.length;
    this.props.search(this.props.term, this.props.search_type, this.state.cases_number, offset, this.state.typeOfCause);
  }

  updateTerm = (e) => {
    this.props.updateTerm(e.target.value);
  }

  updateCasesNumber = (e) => {
    this.setState({ cases_number: Number(e.target.value) });
  }

  filterSearchField = (e) => {
    this.setState({ filterSearchField: e.target.value });
  }

  saveUser = (e) => {
    this.props.saveUserId(e.target.value);
  }

  changeTypeOfCause = (value) => {
    this.setState({ typeOfCause: value });
    this.props.clearCases();
    this.props.updateSearchType(this.state.search_type);
    this.props.search(this.props.term, this.state.search_type, this.state.cases_number, 0, value);
  }

  saveRuts = (e) => {
    e.preventDefault();
    const token = document.querySelector('meta[name=csrf-token]').getAttribute("content");
    const cases = this.props.selected.map(el => {
      return { crr_idcausa: el.case.crr_idcausa, crr_idcausa_type: 'laboral' }
    });
    this.props.saveRuts(this.props.user_id, cases, token);
    this.props.clearCases();
  }

  toggleSelectAll = () => (e) => {
    this.props.toggleSelectAll(!this.state.selectAll);
    this.setState({ selectAll: !this.state.selectAll });
  }

  render() {
    const { filterSearchField, typeOfCause, cases_number, selectAll } = this.state;
		return (
      <div className="container-fluid">
        <div className="row m-t-20">
          <div className="col-12">
            <div className="card-box">
              <h1>Laboral RUT Selection</h1>
              <div className="m-t-20">
                <form>
                  <div className="form-group row">
                    <div className="col-lg-4 col-sm-12">
                      <div className="input-group">
                        <select className='form-control' onChange={this.saveUser} value={this.props.user_id}>
                        <option key={ _.uniqueId() }>Elegir usuario</option>
                        { this.props.users_emails.map(el => {
                            return (<option value={el[1]} key={ _.uniqueId() }>{el[0]}</option>)
                          })
                        }
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group row">
                    <div className="col-lg-4 col-sm-12">
                      <div className="input-group">
                        <input className='form-control' placeholder='Ingrese RUT o Nombre' id='search-field'
                          onChange={this.updateTerm} />
                      </div>
                    </div>
                    <div className='m-r-10'>
                      <button type='button' onClick={this.search('rut')}
                        className='btn btn-primary waves-effect waves-light'>
                        Buscar por RUT
                      </button>
                    </div>
                    <div className='m-r-10'>
                      <button type='button' onClick={this.search('name')}
                        className='btn btn-primary waves-effect waves-light'>
                        Buscar por Nombre
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group row">
                    <div className="col-lg-4 col-sm-12">
                      {this.props.user_id !== 0 && this.props.cases.length > 0 &&
                      <button type='button' onClick={this.saveRuts}
                        className='btn btn-primary waves-effect waves-light'>
                        Save RUTs
                      </button>}
                    </div>
                    <div className="btn-group">
                      <button type="button" className="btn btn-info dropdown-toggle waves-effect waves-light" data-toggle="dropdown" aria-expanded="false">{typeOfCause === '' ? 'Tipo de Causa' : typeOfCause}<span className="caret"></span></button>
                      <div className="dropdown-menu">
                        <a className="dropdown-item" onClick={() => { this.changeTypeOfCause('Laboral' ); }} href="#">Laboral</a>
                        <a className="dropdown-item" onClick={() => { this.changeTypeOfCause('Civil' ); }} href="#">Civil</a>
                        <a className="dropdown-item" onClick={() => { this.changeTypeOfCause('Cobranzas' ); }} href="#">Cobranzas</a>
                      </div>
                    </div>
                  </div>

                  {this.props.took_time !== 0 && <div className="form-group row">
                    <div className="col-lg-4 col-sm-12">
                      <span>
                        Respuesta en X milisegundos: {this.props.took_time}
                      </span>
                    </div>
                  </div>}
                </form>
              </div>
            </div>
          </div>
        </div>
        { this.props.cases.length > 0 &&
          <div className="row">
            <div className="col-12">
              <div className="card-box">
                <div className="row">
                  <input value={filterSearchField} className='filter-search-field' placeholder='Search' id='search-word-field'
                    onChange={this.filterSearchField} />
                </div>
                <div className="row query-result-container">
                  <button type='button' onClick={this.updatePage}
                    className='btn btn-primary waves-effect waves-light'>
                    Load more results
                  </button>
                  <input value={cases_number} type='number' className='query-input-field' placeholder='Cantidad de Causas' id='case-field'
                    onChange={this.updateCasesNumber} />
                  <span className="pull-right text-muted query-text-field">
                    Selected {this.props.selected.length} of {this.props.total}
                  </span>
                </div>
                <div className="table-responsive">
                  <table className="table m-t-20 table-bordered">
                    <thead className="thead-light">
                      <tr>
                        <th style={{ 'textAlign': 'center' }}>
                          <div className='checkbox checkbox-primary checkbox-single'>
                            <input type="checkbox"
                              onChange={this.toggleSelectAll()}
                              checked={selectAll}
                            />
                            <label></label>
                          </div>
                        </th>
                        <th>CRR IDCAUSA</th>
                        <th>Nombre o razon social</th>
                        <th>RUT</th>
                        <th>Persona</th>
                        <th>Sujeto</th>
                      </tr>
                    </thead>
                    <tbody className="tbody-light">
                      { this.props.cases.map(el => {
                          let { crr_idcausa, nombre_o_razon_social, rut, sujeto, persona, sujento, participante, url, inc_idx } = el.case;
                          let real_crr_idcausa = typeOfCause === 'Civil' ? url : crr_idcausa;
                          let real_sujeto = typeOfCause === 'Cobranzas' ? sujento : typeOfCause === 'Civil' ? participante : sujeto;
                          if (`${real_crr_idcausa}`.indexOf(filterSearchField.toUpperCase()) >= 0
                            || `${nombre_o_razon_social}`.indexOf(filterSearchField.toUpperCase()) >= 0
                            || `${rut}`.indexOf(filterSearchField.toUpperCase()) >= 0
                            || `${real_sujeto}`.indexOf(filterSearchField.toUpperCase()) >= 0
                            || `${persona}`.indexOf(filterSearchField.toUpperCase()) >= 0) {
                              return (
                                <tr key={_.uniqueId()} className={el.selected ? 'table-info' : ''}>
                                  <td style={{ 'textAlign': 'center' }}>
                                    <div className='checkbox checkbox-primary checkbox-single'>
                                      <input type="checkbox"
                                        onChange={this.toggleSelect(inc_idx)}
                                        checked={el.selected}
                                      />
                                      <label></label>
                                    </div>
                                  </td>
                                  <td>{real_crr_idcausa}</td>
                                  <td>{nombre_o_razon_social}</td>
                                  <td>{rut}</td>
                                  <td>{persona}</td>
                                  <td>{real_sujeto}</td>
                                </tr>
                              )
                            }
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}