<div class="kayak-widgets-pop-pop pop-mod" style="display:none;">
	<div class="J_PopCont pop">
	</div>
	<script class="J_PopTemp" type="text/html">
		<%if(title){%><div class="head"><%= title%></div><%}%>
		<%if(msg){%><div class="content"><%= msg%></div><%}%>
		<%if(html){%><%=#html%><%}%>
		<div class="act clearfix">
			<% var p; %>
			<% for ( p in btns ) { %>
				<span data-type="<%=p%>" style="<%= styles%>"><%=btns[p].text%></span>
			<% } %>
		</div>
	</script>
	<div class="J_PopMask mask"></div>
</div>
