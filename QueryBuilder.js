function GetSearchQuery(params){
  let query = "";
  console.log(params.languages.length);
  if(params.languages.length == 1){
    query += "language:"+params.languages[0];
  }else{
    params.languages.forEach((language) => {
      query += `language:${language} `;
    });
  }

  if(params.created){
    query += `created:${params.created}`
  }
  return query;
}

function GreaterThan(value){
  return ">="+value;
}

module.exports.GetSearchQuery = GetSearchQuery;
module.exports.GreaterThan = GreaterThan;
