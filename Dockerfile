# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Gixat.csproj", "./"]
RUN dotnet restore "Gixat.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "Gixat.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Gixat.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=publish /app/publish .

# Create non-root user
RUN useradd -m -s /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3002/health/live || exit 1

# Entry point
ENTRYPOINT ["dotnet", "Gixat.dll"]
